import React, { useEffect, useState } from 'react'

const InfiniteScrolling = () => {
      const [page, setPage] = useState(1);
      const [data, setData] = useState([]);
      console.log(data);

      let scrollHeight = document.documentElement.scrollHeight;
      let scrollTop = document.documentElement.scrollTop;
      let clientHeight = document.documentElement.clientHeight;
      console.log('scrollHeight : ',scrollHeight,'scrollTop : ',scrollTop,'clientHeight : ',clientHeight)
      

      useEffect(() => {
            const fetchData = async () => {
              try {
                const res = await fetch(`https://reqres.in/api/users?page=${page}`);
                const resData = await res.json();
                const newData = resData.data;
                setData((prev) => [...prev, ...newData]);
              } catch (error) {
                console.log(error);
              }
            };
            fetchData();
            }, [page]
      );
          
  return (
    <div>
      <h1>InfiniteScrolling</h1>
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

export default InfiniteScrolling