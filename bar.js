class Barn {
  constructor(config) {
    this.config = config;

    this.svg = null;
    this.margins = null;

    this.xScale = null;
    this.yScale = null;
  

    this.bins = [];

    this.createSvg();
    this.createMargins();
  }

  createSvg() {
    this.svg = d3.select(this.config.div)
      .append("svg")
      .attr('x', 10)
      .attr('y', 10)
      .attr('width', this.config.width + this.config.left + this.config.right)
      .attr('height', this.config.height + this.config.top + this.config.bottom);
  }


  createMargins() {
    this.margins = this.svg
      .append('g')
      .attr("transform", `translate(${this.config.left},${this.config.top})`)
  }


  async loadCSV(file) {
    this.bins = await d3.csv(file, d => {
      return {
        val: +d.TotalS,
        cat: d.Region,
        cat1: d.OrderDate,
      }
    });
    this.bins = this.bins.sort((a, b) => d3.descending(a.val, b.val));
   
  }

  createScales() {
    let yExtent = d3.extent(this.bins, d => {
      return d.val;
    });

    let xExtent = this.bins.map(d => {
      return d.cat;
    });

    this.xScale = d3.scaleBand().domain(xExtent).range([0, this.config.width]).padding(0.2);
    this.yScale = d3.scaleLinear().domain(yExtent).nice().range([this.config.height, 0]);
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
    this.margins.selectAll('rect')
      .data(this.bins)
      .join('rect')
      .attr('x', (d, i) => this.xScale(d.cat))
      .attr('y', d => this.yScale(d.val))
      .attr("width", this.xScale.bandwidth())
      .attr("height", d => this.yScale(0) - this.yScale(d.val))
      .style('fill', 'RoyalBlue')
  }
}

async function main() {
  let c = { div: '#gbar', width: 1000, height: 800, top: 30, left: 50, bottom: 50, right: 30 };

  let app = new Barn(c);

  await app.loadCSV('ProfitSales_cross.csv');

  
  app.createScales();
  app.createAxis();
  app.render();
}

main();
