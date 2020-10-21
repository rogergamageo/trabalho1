class Bar {
  constructor(config) {
    this.config = config;

    this.svg = null;
    this.margins = null;
    this.botton = null;

    this.xScale = null;
    this.yScale = null;
    this.allGroup = null;

    this.bins = [];
  

    this.createSvg();
    this.createViewBox();
    this.createMargins();
    this.createBotton();
  }

  createSvg() {
    this.svg = d3.select(this.config.div)
      .append("svg")
      .attr('x', 10)
      .attr('y', 10)
      .attr('width', this.config.width + this.config.left + this.config.right)
      .attr('height', this.config.height + this.config.top + this.config.bottom);
  }

  createViewBox(){
    const svg = d3.create("svg")
      .attr("viewBox", [0, 0, this.config.width, this.config.height]);
  }

  createMargins() {
    this.margins = this.svg
      .append('g')
      .attr("transform", `translate(${this.config.left},${this.config.top})`)
  }



  async loadCSV(file) {
    this.bins = await d3.csv(file, d => {
      return {
        val: +d.Sales,
        cat: d.Region,
        cat1: new Date (d.OrderDate),
      }

    });
    this.bins = this.bins.sort((a, b) => d3.descending(a.val, b.val));
    this.dataFilter = d3.filter(this.bins, d => d.cat1);
   
  }
 
  createBotton(){
    this.botton = d3.select("selectBotton")
                    .append('svg')
                    .text(d => d.dataFilter)
                    .attr('date', d => d);

  }
  createScales() {
    let xExtent = d3.map(this.bins, d => d.cat);
    let yExtent = d3.extent(this.bins, (d, i) => d.val);

    this.xScale = d3.scaleBand().domain(xExtent).rangeRound([0, this.config.width]).padding(0.5);
    this.yScale = d3.scaleLinear().domain(yExtent).nice().rangeRound([this.config.height, 0]);
    
  }

  createAxis() {
    let xAxis = d3.axisBottom(this.xScale);
    let yAxis = d3.axisLeft(this.yScale);

    this.margins
      .append("g")
      .attr("transform", `translate(0,${this.config.height})`)
      .call(xAxis)
      .selectAll("text")
        .attr("transform", "translate(15,10)rotate(0)")
        .style("text-anchor", "end");
   
    this.margins
      .append("g")
      .attr("transform", `translate(${0},0)`)
      .call(yAxis);
  }

  render() {
    let t = d3.transition()
      .duration(1500);

    this.margins.selectAll('rect')
      .data(this.bins)
      .enter()
        .append('rect')
        .transition(t)
        .style('fill', 'RoyalBlue')
        .attr('x', (d, i) => this.xScale(d.cat))
        .attr('y', d => this.yScale(d.val))
        .attr("width", this.xScale.bandwidth())
        .attr("height", d => this.yScale(0) - this.yScale(d.val))
        .style('fill', 'RoyalBlue')
      .update()
        .data(this.dataFilter)
        .append('rect')
        .transition(t)
      .exit()
        .remove();

  }
}

async function main() {
  let c = { div: '#gbar2', width: 1000, height: 800, top: 30, left: 50, bottom: 50, right: 30 };

  let app = new Bar(c);

  await app.loadCSV('storenewsum2.csv');

  
  app.createScales();
  app.createAxis();
  app.render();
}

main();
