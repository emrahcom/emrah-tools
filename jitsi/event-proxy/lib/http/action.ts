export async function post(url: string, serializedJson: string) {
  console.log(serializedJson);

  const res = await fetch(url, {
    headers: {
      "Accept": "application/json",
    },
    method: "post",
    body: serializedJson,
  });

  return res;
}
