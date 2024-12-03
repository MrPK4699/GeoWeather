import React, { useEffect, useState } from 'react'

const Pagination = () => {
      const [page, setPage] = useState(1);
      const [data, setData] = useState([]);
      console.log(data);
      useEffect(() => {
            const fetchData = async () => {
              try {
                const res = await fetch(`https://reqres.in/api/users?page=${page}`);
                const resData = await res.json();
                const newData = resData.data;
                setData( [...newData] );
              } catch (error) {
                console.log(error);
              }
            };
            fetchData();
            }, [page]
      );
          
  return (
    <div style={{width: 'fit-content',margin:'auto'}}>
      <h1>Pagination</h1>
      <button onClick={()=>setPage(1)}>1</button>
      <button onClick={()=>setPage(2)}>2</button>
      <button onClick={()=>setPage(3)}>3</button>
      <button onClick={()=>setPage(4)}>4</button>
      <button onClick={()=>setPage(5)}>5</button>
      {data.length>0 && 
        data.map((ele)=>(
            <div key={ele.id}>
                  <img src={ele.avatar} alt={ele.first_name}/>
                  <p>{ele.first_name} {ele.last_name}</p>
                  <p>{ele.email}</p>
            </div>
        ))
      }
    </div>
  )
}

export default Pagination