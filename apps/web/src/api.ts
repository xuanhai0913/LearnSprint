export class ApiError extends Error {
  constructor(message:string,readonly code:string){super(message);}
}
export async function api<T>(path:string,body?:unknown):Promise<T>{
  let response:Response;
  try{response=await fetch(`/api${path}`,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});}
  catch{throw new ApiError('Cannot reach your local workspace. Your draft is kept. Check that the API is running, then retry.','NETWORK');}
  const data=await response.json().catch(()=>null);
  if(!response.ok)throw new ApiError(data?.message??'The request could not be completed.',data?.code??'REQUEST_FAILED');
  return data as T;
}
