# Cloud functions

`searchPlaces` is an HTTP CloudBase function used by the mini-program.

Required environment variables:

- `TENCENT_MAP_KEY`
- `TENCENT_MAP_SK`

Optional Baidu review enrichment:

- `BAIDU_MAP_AK`
- `BAIDU_MAP_SK`

When both Baidu variables are present, POI search prefers Baidu Place Search 2.0 so rating, review count, reported price and opening hours can participate in recommendation ranking. A failed or empty Baidu query automatically falls back to Tencent Location Service. Tencent remains available for verified anchor venues and navigation coordinates.

Never place provider credentials in mini-program source code.
