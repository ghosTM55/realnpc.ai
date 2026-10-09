import Image from "next/image";
import pureSoul from "@/media/soul/pure-soul.webp";
import type { SoulCapabilities } from "@/domain/companion/capabilities";

export type CapabilityGroup = keyof SoulCapabilities;
const axes = ["Empathy", "Humor", "Curiosity", "Creativity", "Confidence", "Analysis"];
function point(index: number, radius: number) {
  const angle = index * Math.PI / 3 - Math.PI / 2;
  return [160 + Math.cos(angle) * radius, 145 + Math.sin(angle) * radius];
}

export function CapabilityVisual({ group, value }: { group: CapabilityGroup; value: SoulCapabilities }) {
  return <div className={`cap-visual cap-visual-${group}`} aria-hidden="true">
    {group === "mind" && <svg viewBox="0 0 320 290">
      {[30, 60, 90].map(radius => <polygon key={radius} points={axes.map((_, i) => point(i, radius).join(",")).join(" ")} className="cap-grid-line" />)}
      {axes.map((label, i) => { const [x, y] = point(i, 118); return <g key={label}><line x1="160" y1="145" x2={point(i, 90)[0]} y2={point(i, 90)[1]} className="cap-grid-line" /><text x={x} y={y} textAnchor="middle" dominantBaseline="middle">{label}</text></g>; })}
      <polygon points={Object.values(value.mind).map((n, i) => point(i, 12 + n * .78).join(",")).join(" ")} className="cap-radar-fill" />
      {Object.values(value.mind).map((n, i) => <circle key={i} cx={point(i, 12 + n * .78)[0]} cy={point(i, 12 + n * .78)[1]} r="3" className="cap-dot" />)}
      <text x="160" y="280" textAnchor="middle" className="cap-diagram-caption">YOUR CHARACTER’S STYLE</text>
    </svg>}
    {group === "expression" && <div className="cap-sample"><span className="cap-visual-label">SAMPLE EXPRESSION</span><p className="cap-sample-user">I finally took that trip.</p><p className="cap-sample-reply">{value.expression.replyLength === "brief" ? "You went! What stayed with you?" : value.expression.replyLength === "detailed" ? "You finally went. I remember how much you wanted a change of scene. Tell me about one moment you wish you could step back into." : "You finally went! Tell me about the moment you wish you could bottle up."}{value.expression.emojis ? " ✨" : ""}</p><span className="cap-sample-caption">Illustrative tone · not a live reply</span><div className="cap-type-lines"><i /><i /><i /></div></div>}
    {group === "knowledge" && <svg viewBox="0 0 320 290"><circle cx="160" cy="145" r="100" className="cap-grid-line" /><circle cx="160" cy="145" r="61" className="cap-grid-line" />{["Art", "Science", "Stories", "Music", "Ideas", "Travel"].map((label, i) => { const [x, y] = point(i, 102); return <g key={label}><line x1="160" y1="145" x2={x} y2={y} className="cap-grid-line" /><circle cx={x} cy={y} r="23" className="cap-node" /><text x={x} y={y + 3} textAnchor="middle">{label}</text></g>; })}<circle cx="160" cy="145" r="32" className="cap-core" /><text x="160" y="144" textAnchor="middle" className="cap-core-text">{value.knowledge.interests.length + value.knowledge.skills.length}</text><text x="160" y="160" textAnchor="middle" className="cap-core-small">FOCUSES</text></svg>}
    {group === "memory" && <div className="cap-memory-art"><span className="cap-visual-label">A SHARED HISTORY</span><div className="cap-memory-card"><span>01 / PREFERENCES</span><p>The little things you love.</p><i /></div><div className="cap-memory-card"><span>02 / MOMENTS</span><p>The stories you share.</p><i /><i /></div><div className="cap-memory-card"><span>03 / CONNECTION</span><p>What makes it yours.</p><i /></div><span className="cap-sample-caption">Memory concept · not connected</span></div>}
    {group === "presence" && <><Image src={pureSoul} alt="" unoptimized className="cap-presence-image" /><div className="cap-voice-wave">{Array.from({ length: 25 }, (_, i) => <i key={i} style={{ height: `${8 + Math.abs(Math.sin(i * 1.9)) * (18 + value.presence.expressiveness * .35)}px` }} />)}</div><span className="cap-presence-caption">VOICE · EXPRESSION · PERCEPTION</span></>}
    {group === "world" && <svg viewBox="0 0 320 290"><ellipse cx="160" cy="145" rx="133" ry="65" className="cap-grid-line" transform="rotate(-25 160 145)" /><ellipse cx="160" cy="145" rx="115" ry="90" className="cap-grid-line" transform="rotate(30 160 145)" />{[0, 1, 2, 3, 4, 5].map(i => { const [x, y] = point(i, 96); return <g key={i}><line x1="160" y1="145" x2={x} y2={y} className="cap-grid-line" /><circle cx={x} cy={y} r={i < value.world.sociability / 17 ? 10 : 5} className="cap-dot" /></g>; })}<circle cx="160" cy="145" r="30" className="cap-core" /><text x="160" y="149" textAnchor="middle" className="cap-core-small">YOUR SOUL</text><text x="160" y="280" textAnchor="middle" className="cap-diagram-caption">CONNECTIONS, WITH BOUNDARIES</text></svg>}
  </div>;
}
