let obj={
      firstName: 'john',
      lastName: 'doe',
      c:2,
      greet : function(){
            console.log(this.firstName , this.lastName)
      }
}

obj.greet();


// let arr = [2,3,4,'a','b','c']

// let y= void 0;
// console.log(y);