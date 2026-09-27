export default function CareerPaths({compact=false}:{compact?:boolean}){
  if(compact)return <nav className="career-switch" aria-label="Choose a career"><a href="/career">Operations</a><a href="/career?role=it-support" aria-current="page">IT Support</a><a href="/career?role=it-support">My IT shifts</a></nav>;
  return <section className="career-discovery" aria-label="Career practice">
    <p><a href="/career?view=reviewer">Evaluating LearnSprint? Start with the demo guide ↗</a></p><div className="career-discovery-hero"><div><p className="it-eyebrow">LEARN BY DOING</p><h2>Practice the work.<br/>Build your judgment.</h2><p>Step into a working day. Investigate the facts, make a decision, and see what changes.</p></div><img src="/images/career-workplace-v1.png" alt="" width="1984" height="793" /></div>
    <nav className="career-paths" aria-label="Choose a career">
      <a href="/career"><span>01 / OPERATIONS</span><strong>Keep a delivery promise</strong><small>Balance stock, customer commitments and delivery incidents.</small><em>Bedrock assisted · MCP tools</em><b>Explore operations <span aria-hidden="true">↗</span></b></a>
      <a href="/career?role=it-support"><span>02 / IT SUPPORT</span><strong>Take charge of the service desk</strong><small>Investigate tickets, set priorities and coordinate the next response.</small><em>Authored simulation</em><b>Explore IT support <span aria-hidden="true">↗</span></b></a>
    </nav>
    <ol className="career-method"><li><span>01</span><div><strong>Investigate</strong><p>Open the source. Find what matters.</p></div></li><li><span>02</span><div><strong>Decide</strong><p>Choose an action within real constraints.</p></div></li><li><span>03</span><div><strong>Handoff</strong><p>Leave the next person a useful record.</p></div></li></ol>
  </section>;
}
