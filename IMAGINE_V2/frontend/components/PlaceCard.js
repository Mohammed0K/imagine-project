export default function PlaceCard({place}){
    
    return(
    <div className='card'>
        <h3>{place.name}</h3>
        <div style={{opacity:.7}}>{place.region}</div>
        <p>{place.description}</p>
        <a className='btn' href={`/places/${place.id}`}>View</a>
        </div>)
        
    }