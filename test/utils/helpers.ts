export function deserialize<DataType = any>(data: DataType) {
  return JSON.parse(JSON.stringify(data))
}