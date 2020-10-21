class Scatter {
  constructor(config) {
    this.config = config;

    this.svg = null;
    this.margins = null;

    this.xScale = null;
    this.yScale = null;

    this.circles = []

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
    this.circles = await d3.csv(file, d => {
      return {
        cx: +d.Sales,
        cy: +d.Profit,
        col: d.Discount,
        cat: d.Region,
        r: 4
      }
    });

    this.circles = this.circles.slice(0, 1000);
  }

  createScales() {
    let xExtent = d3.extent(this.circles, d => {
      return d.cx;
    });
    let yExtent = d3.extent(this.circles, d => {
      return d.cy;
    });
    let colExtent = d3.extent(this.circles, d => {
      return d.col;
    });

    const cats = this.circles.map(d => {
      return d.cat;
    });
    let catExtent = d3.union(cats);

    this.xScale = d3.scaleLinear().domain(xExtent).nice().range([0, this.config.width]);
    this.yScale = d3.scaleLinear().domain(yExtent).nice().range([this.config.height, 0]);

    this.colScale = d3.scaleSequential(d3.interpolateOrRd).domain(colExtent);
    this.catScale = d3.scaleOrdinal().domain(catExtent).range(d3.schemeTableau10);
  }

  createAxis() {
    let xAxis = d3.axisBottom(this.xScale)
      .ticks(15);

    let yAxis = d3.axisLeft(this.yScale)
      .ticks(15);

    this.margins
      .append("g")
      .attr("transform", `translate(0,${this.config.height})`)
      .call(xAxis);

    this.margins
      .append("g")
      .call(yAxis);
  }

  renderCircles() {
    this.margins.selectAll('circle')
      .data(this.circles)
      .join('circle')
      .attr('cx', d => this.xScale(d.cx))
      .attr('cy', d => this.yScale(d.cy))
      .attr('r' , d => d.r)
      //.attr('fill', d => this.colScale(d.col));
      .attr('fill', d => this.catScale(d.cat));
  }
}


async function main() {
  let c = {div: '#scatter', width: 1000, height: 600, top: 30, left: 50, bottom: 30, right: 30};
  
  let a = new Scatter(c);
  await a.loadCSV('storenewsum.csv');
  
  a.createScales();
  a.createAxis();
  a.renderCircles();
}

main();
