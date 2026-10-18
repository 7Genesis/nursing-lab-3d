# Exporta as malhas do Startup.blend do Z-Anatomy (CC BY-SA 4.0) para arquivos binários simples.
# Uso: blender -b <Startup.blend> --python scripts/zanatomy-dump.py -- <pasta-de-saída>
# Cada objeto vira <saída>/<n>.bin: int32 nV, int32 nT, float32[nV*3] (mundo, metros), uint32[nT*3].
# index.json lista nome, coleções (da folha até a raiz), polígonos e caixa envolvente.
import sys, os, json
import bpy
import numpy as np

out = sys.argv[sys.argv.index('--') + 1]
os.makedirs(out, exist_ok=True)
deps = bpy.context.evaluated_depsgraph_get()

parent_of = {}
for c in bpy.data.collections:
    for ch in c.children:
        parent_of[ch.name] = c.name

def chain(c):
    r = [c.name]
    while r[-1] in parent_of:
        r.append(parent_of[r[-1]])
    return r

index = []
for o in bpy.data.objects:
    if o.type != 'MESH' or len(o.data.polygons) == 0:
        continue
    ev = o.evaluated_get(deps)
    me = ev.to_mesh()
    me.calc_loop_triangles()
    nv, nt = len(me.vertices), len(me.loop_triangles)
    if nt == 0:
        ev.to_mesh_clear()
        continue
    co = np.empty(nv * 3, dtype=np.float32)
    me.vertices.foreach_get('co', co)
    co = co.reshape(-1, 3)
    m = np.array(ev.matrix_world, dtype=np.float32)
    co = co @ m[:3, :3].T + m[:3, 3]
    tri = np.empty(nt * 3, dtype=np.uint32)
    me.loop_triangles.foreach_get('vertices', tri)
    n = len(index)
    with open(os.path.join(out, f'{n}.bin'), 'wb') as f:
        f.write(np.array([nv, nt], dtype=np.int32).tobytes())
        f.write(co.astype(np.float32).tobytes())
        f.write(tri.tobytes())
    index.append({
        'n': n, 'name': o.name, 'polys': nt,
        'cols': [x for c in o.users_collection for x in chain(c)][:12],
        'min': co.min(axis=0).round(4).tolist(), 'max': co.max(axis=0).round(4).tolist(),
    })
    ev.to_mesh_clear()

json.dump(index, open(os.path.join(out, 'index.json'), 'w'))
print('ZDUMP', len(index), 'objetos')
