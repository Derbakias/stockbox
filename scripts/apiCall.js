async function getData(src) {
  const request = await fetch(src);
  if(request.status !== 200){
    throw new Error('Can not fetch the data');
  }
  const data = await request.json();
  return data;
}
