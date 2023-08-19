// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const flatObject = (obj: any, out: any) => {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] == 'object') {
      out = flatObject(obj[key], out) //recursively call for nesteds
    } else {
      out[key] = obj[key] //direct assign for values
    }
  })
  return out
}
