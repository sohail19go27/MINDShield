(async ()=>{
  try{
    const res = await fetch('http://localhost:5000/api/analyzeDistraction',{
      method:'POST',
      headers:{'content-type':'application/json'},
      body: JSON.stringify({
        habit: 'Scrolling reels before bed',
        trigger: 'Boredom',
        triggerDetail: 'Often when I am alone late at night',
        emotionalIntensity: 4,
        smallStep: 'Turn off phone at 10:30 PM',
        replacement: 'Read 10 pages'
      })
    })
    const j = await res.json()
    console.log(JSON.stringify(j,null,2))
  }catch(e){
    console.error(e)
  }
})()
