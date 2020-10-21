class Line {
    constructor(config) {
      this.config = config;
  
      this.svg = null;
      this.margins = null;
  
      this.cline = null;
  
      this.xScale = null;
      this.yScale = null;
  
      this.line = [];
      this.cline = null;
  
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
      this.line = await d3.csv(file, d => {
        return {
          val: +d.Sales,
          cat: new Date(d.OrderDate),
        }
      });
  
      this.line = this.line.slice(0, 100);
      console.log(this.line[0]);
    }
  
    createScales() {
  
      let xExtent = d3.extent(this.line, d => d.cat);
      let yExtent = d3.extent(this.line, (d, i) => d.val);
  
      this.xScale = d3.scaleTime().domain(xExtent).range([0, this.config.width]);
      this.yScale = d3.scaleLinear().domain(yExtent).nice().range([this.config.height, 0]);
    }
  
    createLine() {
      this.cline = d3.line()
        .x(d => this.xScale(d.cat))
        .y(d => this.yScale(d.val));
      }
  
  
    createAxis() {
      let xAxis = d3.axisBottom(this.xScale);
      let yAxis = d3.axisLeft(this.yScale);
  
      this.margins
        .append("g")
        .attr("transform", `translate(0,${this.config.height})`)
        .call(xAxis)
  
  
      this.margins
        .append("g")
        .attr("transform", `translate(${0},0)`)
        .call(yAxis);
  
    }
  
    render() {
      this.margins.selectAll('sales')
        .data([this.line])
        .join('path')
        .attr("class", "sales")
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr("stroke-width", 10)
        .attr("d", this.cline);
    }
  }
  
  async function main() {
    let c = { div: '#main', width: 1000, height: 800, top: 30, left: 50, bottom: 50, right: 30 };
  
    let app = new Line(c);
  
    await app.loadCSV('storedatee.csv');
  
    app.createScales();
    app.createAxis();
    app.createLine();
    app.render();
  }
  
  main();
