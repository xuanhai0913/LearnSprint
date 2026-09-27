"""Small remote MCP audit; no local server, build or model calls. Creates one fictional shift."""
import json, uuid, urllib.request, urllib.error
ORIGIN = 'https://d2g4a2ezl5lw7r.cloudfront.net'
def bootstrap():
    with urllib.request.urlopen(ORIGIN + '/api/career/home') as r:
        return r.headers.get('Set-Cookie').split(';')[0]
def call(cookie, method, params, origin=ORIGIN):
    body=json.dumps({'jsonrpc':'2.0','id':str(uuid.uuid4()),'method':method,'params':params}).encode()
    request=urllib.request.Request(ORIGIN+'/api/career/mcp',data=body,headers={'Content-Type':'application/json','Accept':'application/json, text/event-stream','Origin':origin,'Cookie':cookie,'MCP-Protocol-Version':'2025-11-25'})
    try:
        with urllib.request.urlopen(request) as r:return r.status,json.load(r)
    except urllib.error.HTTPError as e:return e.code, json.loads(e.read())
def tool(cookie,name,args):
    status,body=call(cookie,'tools/call',{'name':name,'arguments':args})
    assert status==200, (status,body)
    result=body['result']
    return result,json.loads(result['content'][0]['text'])
a,b=bootstrap(),bootstrap()
status,init=call(a,'initialize',{'protocolVersion':'2025-11-25','capabilities':{},'clientInfo':{'name':'learnsprint-release-audit','version':'1.0'}})
assert status==200
version=init['result']['protocolVersion'];assert version=='2025-11-25'
status,listing=call(a,'tools/list',{});assert status==200
_,home=tool(a,'career_home',{})
args={'requestId':str(uuid.uuid4()),'packVersion':home['brief']['version']}
_,created=tool(a,'career_open_shift',args)
sid=created['workspace']['session']['id']
_,retry=tool(a,'career_open_shift',args)
assert retry['workspace']['session']['id']==sid
foreign,detail=tool(b,'career_workspace',{'sessionId':sid})
assert foreign.get('isError') is True
assert 'workspace' not in detail
bad_origin,_=call(a,'tools/list',{},'https://example.invalid');assert bad_origin==403
print(json.dumps({'protocol':version,'tools':[t['name'] for t in listing['result']['tools']], 'duplicateOpenSameShift':True,'foreignOwnerDenied':True,'wrongOriginStatus':bad_origin,'paidInference':False,'createdFictionalShifts':1},indent=2))
