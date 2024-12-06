import React, { useEffect, useState } from 'react'

const DynamicForcasting = ({weatherData}) => {
      console.log(weatherData);
      const currDt= new Date();
      console.log(currDt.toISOString().slice(0,10))
      const [dates, setDate] = useState(currDt.toISOString().slice(0,10));
      const [filteredData, setFilteredData] = useState([]);

      const handleChange = async(e)=>{
            const x= e || currDt;
            setDate(x);
            // console.log(typeof(dates), dates)
            const filterArr= weatherData.forecast.filter((ele=>{
                  // const dt=
                  return ele.dt_txt.slice(0,10) == x
            }))
            await setFilteredData(()=>filterArr);
      }
      // handleChange();
      // useEffect(()=>{
      //       handleChange();
      // },[])
      return (
            <div>
                  <h1>DynamicForcasting</h1>
                  <input type='date' onChange={(e)=>{
                        e.preventDefault();
                        handleChange(e.target.value);
                  }} value={dates}/>
                  {filteredData.length < 1 ? ( <div>No Data Found</div>) : (
                        filteredData.map((ele, index) => <div key={index}>{ele.dt}</div>)
                  )}

            </div>
      )
}

export default DynamicForcasting;