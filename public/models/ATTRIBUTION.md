# Atribuição dos modelos 3D

Os arquivos `*.glb` desta pasta são obras derivadas de dados abertos. Eles seguem a licença **Creative Commons Atribuição-CompartilhaIgual (CC BY-SA)**: quem redistribuir ou adaptar deve manter a atribuição e usar a mesma licença.

- **Ossos, músculos, órgãos, cérebro e sistema nervoso:** Z-Anatomy, "The libre 3D atlas of anatomy", CC BY-SA 4.0. https://github.com/Z-Anatomy/Models-of-human-anatomy. Nomes em português, latim e inglês: Terminologia Anatômica 2 (TA2.csv do mesmo projeto).
- **Pele e vasos:** BodyParts3D, © The Database Center for Life Science, licenciado sob CC Atribuição-CompartilhaIgual 2.1 Japão. https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html
- Z-Anatomy, por sua vez, deriva do BodyParts3D.

Alterações feitas por este projeto: seleção das peças, conversão para GLB, simplificação da malha (menos triângulos), junção de vértices, normais recalculadas e compressão com meshopt. Os dados de origem não estão no repositório. Veja `scripts/` para refazer a conversão.

Modelo anatômico representativo, sem validação clínica. Este conteúdo é didático.
