export default function GuideCard(
    
    {guide}){
        return(
        <div className='card'>
            <h3>{guide.name}</h3>
            <div style={{opacity:.7}}>{guide.region} • {(guide.languages||[]).join(', ')}</div>
            <p>{guide.bio}</p>
            <a className='btn primary' href={`/guides/${guide.id}`}>Book</a>
            </div>)
            
    }