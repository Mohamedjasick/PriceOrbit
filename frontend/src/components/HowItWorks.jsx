function HowItWorks(){

const steps = [

{
icon:"🔎",
title:"Search Product",
text:"Search any product or paste a product link."
},

{
icon:"💰",
title:"Compare Prices",
text:"We compare prices from Amazon, Flipkart and other platforms."
},

{
icon:"⭐",
title:"Save Best Deal",
text:"Save products and track the best deals easily."
}

]

return(

<div className="how-section">

<h2>How PriceOrbit Works</h2>

<div className="how-container">

{steps.map((step,index)=>(

<div key={index} className="how-card">

<div className="how-icon">
{step.icon}
</div>

<h3>{step.title}</h3>

<p>{step.text}</p>

</div>

))}

</div>

</div>

)

}

export default HowItWorks

