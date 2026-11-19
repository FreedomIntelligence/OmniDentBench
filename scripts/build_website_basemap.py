"""Build the website's land-only SVG from Natural Earth's public-domain GeoJSON.

Download source (ne_110m_land.geojson):
https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson
Usage: python scripts/build_website_basemap.py PATH_TO_GEOJSON
The equirectangular projection matches docs/assets/network.js.
"""

import json
from pathlib import Path
import sys


def project(coordinate):
    longitude, latitude = coordinate[:2]
    return (longitude + 180) / 360 * 1000, (85 - latitude) / 145 * 500


def build(source):
    paths = []
    for feature in source['features']:
        geometry = feature['geometry']
        polygons = [geometry['coordinates']] if geometry['type'] == 'Polygon' else geometry['coordinates']
        for polygon in polygons:
            rings = []
            for ring in polygon:
                points = [project(coordinate) for coordinate in ring]
                rings.append('M' + 'L'.join(f'{x:.1f},{y:.1f}' for x, y in points) + 'Z')
            paths.append(''.join(rings))
    grid = ''.join(f'<path d="M{x} 0V500"/>' for x in range(0, 1001, 100))
    grid += ''.join(f'<path d="M0 {y}H1000"/>' for y in range(0, 501, 100))
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 500">'
            '<!-- Natural Earth 1:110m land; public domain. No administrative boundaries. '
            'https://www.naturalearthdata.com/about/terms-of-use/ -->'
            '<g fill="none" stroke="#dce7ed" stroke-width="0.7">' + grid + '</g>'
            '<g fill="#cadce6" stroke="#eef4f7" stroke-width="0.8" fill-rule="evenodd">'
            + ''.join(f'<path d="{path}"/>' for path in paths) + '</g></svg>\n')


if __name__ == '__main__':
    source = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
    output = Path(__file__).resolve().parents[1] / 'docs/images/atlas/world-land.svg'
    output.write_text(build(source), encoding='utf-8')
    print(f'Built {output.name}: {output.stat().st_size:,} bytes')
