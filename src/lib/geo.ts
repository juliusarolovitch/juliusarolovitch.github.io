import { geoContains } from 'd3-geo';
import { feature } from 'topojson-client';
import world from 'world-atlas/countries-110m.json';

type Country = GeoJSON.Feature<GeoJSON.Geometry, { name: string }>;

export const countries = (feature(world as any, (world as any).objects.countries) as unknown as GeoJSON.FeatureCollection<
  GeoJSON.Geometry,
  { name: string }
>).features as Country[];

export const countryOf = ([lat, lon]: [number, number], override?: string) =>
  override ?? countries.find((c) => geoContains(c, [lon, lat]))?.properties.name;

export const formatCoords = ([lat, lon]: [number, number]) =>
  `${Math.abs(lat).toFixed(2)}° ${lat < 0 ? 'S' : 'N'}, ${Math.abs(lon).toFixed(2)}° ${lon < 0 ? 'W' : 'E'}`;
