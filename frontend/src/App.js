import React from "react";
import axios from "axios";

class App extends React.Component {
	state = {
		details: [],
		query: "",
	};

	componentDidMount() {
		let data;

		axios
			.get("http://localhost:8000/wel/")
			.then((res) => {
				data = res.data;
				this.setState({
					details: data,
				});
			})
			.catch((err) => {});
	}

	renderSwitch = (param) => {
		switch (param + 1) {
			case 1:
				return "primary ";
			case 2:
				return "secondary";
			case 3:
				return "success";
			case 4:
				return "danger";
			case 5:
				return "warning";
			case 6:
				return "info";
			default:
				return "yellow";
		}
	};

	handleInput = (e) => {
		this.setState({
			[e.target.name]: e.target.value,
		});
	};

	handleSubmit = (e) => {
		e.preventDefault();

		axios
			.post("http://localhost:8000/wel/", {
				query: this.state.query,
				url: "null",
				gender: "null",
				race: "null",
			})
			.then((res) => {
				this.setState({
					query: "",
				});
			})
			.catch((err) => {});
	};

	render() {
		return (
			<div className="container jumbotron ">
				<form onSubmit={this.handleSubmit}>
					<div className="input-group mb-3">
						<div className="input-group-prepend">
							<span className="input-group-text"
								id="basic-addon1">
								{" "}
								Query{" "}
							</span>
						</div>
						<input type="text" className="form-control"
							placeholder="Query"
							aria-label="Username"
							aria-describedby="basic-addon1"
							value={this.state.query} name="query"
							onChange={this.handleInput} />
					</div>

					<button type="submit" className="btn btn-primary mb-5">
						Submit
					</button>
				</form>

				<hr
					style={{
						color: "#000000",
						backgroundColor: "#000000",
						height: 0.5,
						borderColor: "#000000",
					}}
				/>

				{this.state.details.map((detail, id) => (
					<div key={id}>
						<div className="card shadow-lg">
							<div className={"bg-" + this.renderSwitch(id % 6) + " card-header"}>Query {id + 1}</div>
							<div className="card-body">
								<blockquote className={"text-" + this.renderSwitch(id % 6) + " blockquote mb-0"}>
									<footer className="blockquote-footer">
										{" "}
										<cite title="Source Title">{detail.query}</cite>
									</footer>
									<img src={detail.url} alt={detail.query} width="200" height="300"></img>
                  					<h1> Gender : {detail.gender} </h1>
                  					<h1> Race: {detail.race} </h1>
								</blockquote>
							</div>
						</div>
						<span className="border border-primary "></span>
					</div>
				))}
			</div>
		);
	}
}
export default App;

