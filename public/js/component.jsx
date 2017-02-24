var ZureContainer = React.createClass({
    render: function(){
        return (
            <h3>...</h3>
        );
    }
});

class ZMessages extends React.Component {
    render(){
        // Loop through all the messages in the state and create a Message component
        const messages = this.props.items.map((message, i) => {
            return (
                <ZMessage
                    key={i}
                    message={message.message}
                    fromMe={message.fromMe} />
            );
        });

        return <div className="zure-container-box"><div className="container zure-container">{messages}</div></div>;
    }
}


class ZMessage extends React.Component {
    render(){
        console.log("..");
        const fromMe = this.props.fromMe ? 'bot' : '';
        return (
            <div className={`row card-panel zure-row-box ${fromMe}`}><div className="col s12">{this.props.message}</div></div>
        );
    }
}
ZMessage.defaultProps = {
    message: '',
    fromMe: false
};

class ZureComment extends React.Component {
    constructor(props) {
        super(props);
        this.item = '';
        this.state = { bot: false };

        this._handleKeyPress = this._handleKeyPress.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    handleSubmit(e){
        e.preventDefault();
        return;
    }
    _handleKeyPress(e){
        this.setState({item: e.target.value});
        if (e.key === 'Enter') {

            var comment = e.target.value;

            this.props.onFormSubmit(comment, false);
            this.setState({item: ''});
            ReactDOM.findDOMNode(this.refs.item).focus();

            console.log("Text "+comment);
            var $this = this;
            if(comment == 'hi'){
                io.socket.get('/zure/hello', function gotResponse(data, jwRes) {
                    console.log('Server responded with status code ' + jwRes.statusCode + ' and data: ', data);
                });
            }else{
                $.post('/zure/start', {comment:e.target.value}, function(response){
                    console.log("hello %o", (response));
                    document.getElementById('m').focus();

                    //$this.props.bot = true;
                    $this.props.onFormSubmit(response, true);
                    $this.setState({item: ''});
                    ReactDOM.findDOMNode($this.refs.item).focus();
                });

            }

        }
    }

    render(){
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
}

class Zure extends React.Component {
    constructor(props) {
        super(props);
        this.state = {items: [], bot: false} ;

        this.updateItems = this.updateItems.bind(this);
    }

    updateItems(newItem, fromMe){
        var newMessage = {message : newItem, fromMe:fromMe};
        var allItems = this.state.items.concat([newMessage]);
        this.setState({
            items: allItems
        });
    }

    render(){
        return (
            <div>
                <ZMessages key={this.state.items}  items={this.state.items}/>
                <ZureComment onFormSubmit={this.updateItems}/>
            </div>
        );
    }

}

ReactDOM.render(<Zure/>, document.getElementById('content'));