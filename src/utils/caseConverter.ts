import { camelCase, mapKeys, mapValues, snakeCase } from 'lodash';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObject = { [key: string]: any };

function convertKeys(
  obj: AnyObject,
  converter: (key: string) => string,
): AnyObject {
  if (Array.isArray(obj)) {
    return obj.map((v) => convertKeys(v, converter));
  }

  if (obj !== null && obj.constructor === Object) {
    return mapValues(
      mapKeys(obj, (_, key) => converter(key)),
      (value) => convertKeys(value, converter),
    );
  }

  return obj;
}

export function toCamelCase(obj: AnyObject): AnyObject {
  return convertKeys(obj, camelCase);
}

export function toSnakeCase(obj: AnyObject): AnyObject {
  return convertKeys(obj, snakeCase);
}
