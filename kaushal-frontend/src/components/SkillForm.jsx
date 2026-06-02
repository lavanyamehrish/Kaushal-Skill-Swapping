export default function SkillForm({ items, setItems, title }) {
  const add = () => setItems([...items, { domain:"", subdomain:"", level:"Beginner" }]);
  const update = (i, key, val) => {
    const copy = [...items]; copy[i][key] = val; setItems(copy);
  };
  const remove = (i) => setItems(items.filter((_,idx)=>idx!==i));

  return (
    <div className="space-y-3">
      <h3 className="font-medium">{title}</h3>
      {items.map((s, i) => (
        <div key={i} className="grid md:grid-cols-3 gap-2 border p-3 rounded">
          <input className="border p-2 rounded" placeholder="Domain (e.g., Programming)" value={s.domain} onChange={e=>update(i,"domain",e.target.value)} />
          <input className="border p-2 rounded" placeholder="Subdomain (e.g., Python)" value={s.subdomain} onChange={e=>update(i,"subdomain",e.target.value)} />
          <select className="border p-2 rounded" value={s.level} onChange={e=>update(i,"level",e.target.value)}>
            <option>Beginner</option><option>Intermediate</option><option>Expert</option>
          </select>
          <button type="button" onClick={()=>remove(i)} className="text-sm underline col-span-full text-left">Remove</button>
        </div>
      ))}
      <button type="button" onClick={add} className="px-3 py-1 border rounded">Add another</button>
    </div>
  );
}
