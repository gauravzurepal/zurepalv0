var ZureContainer = React.createClass({
    render: function(){
        return (
            <h3>...</h3>
        );
    }
});

var ZureList = React.createClass({
    render: function() {
        var createItem = function(itemText) {
            return (
                <ZureListItem>{itemText}</ZureListItem>
            );
        };
        return <div className="zure-container-box"><div className="container zure-container">{this.props.items.map(createItem)}</div></div>;
    }
});

var ZureListItem = React.createClass({
    render: function(){
        return (
            <div className="row card-panel zure-row-box"><div className="col s12 blue-text text-darken-2">{this.props.children}</div></div>
        );
    }
});

var ZureComment = React.createClass({
    getInitialState: function() {
        return {item: ''};
    },
    handleSubmit: function(e){
        e.preventDefault();
        this.props.onFormSubmit(this.state.item);
        this.setState({item: ''});
        ReactDOM.findDOMNode(this.refs.item).focus();
        return;
    },
    _handleKeyPress: function(e) {
        this.setState({item: e.target.value});
        if (e.key === 'Enter') {

            var comment = e.target.value;

            console.log("Text "+comment);
            if(comment == 'hi'){
                io.socket.get('/zure/hello', function gotResponse(data, jwRes) {
                    console.log('Server responded with status code ' + jwRes.statusCode + ' and data: ', data);
                });
            }else{
                $.post('/zure/start', {comment:e.target.value}, function(response){
                    console.log("hello %o", (response));
                    document.getElementById('m').focus();
                });
            }

        }
    },
    render: function(){
        return (
            <form onSubmit={this.handleSubmit}>
                <input
                    className="zure-box"
                    ref="item"
                    id="m"
                    type="text"
                    placeholder="What is your name pal?"
                    onKeyPress={this._handleKeyPress}
                />
            </form>
        );
    }
});

var Zure = React.createClass({
    getInitialState: function() {
        return {items: []};
    },
    updateItems: function(newItem) {
        var allItems = this.state.items.concat([newItem]);
        this.setState({
            items: allItems
        });
    },
    render: function() {
        return (
            <div>
                <ZureList key={this.state.items}  items={this.state.items}/>
                <ZureComment onFormSubmit={this.updateItems}/>
            </div>
        );
    }
});

ReactDOM.render(<Zure/>, document.getElementById('content'));