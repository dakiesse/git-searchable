// const
var GIT_REPO_SEARCH_API = function(keyword) {
  return 'https://api.github.com/search/repositories?q=' + keyword + ':reactjs&sort=stars&order=desc';
};

var GitRepoSelect = React.createClass({

  getDefaultProps: function() {
    return {
      amountRequestResult: 3,
      requestDelay: 400,
      communityName: 'React Community',
      communityScopeCode: 'reactjs',
    }
  },

  getInitialState: function() {
    return {
      timeoutId: null,
      repoCommunity: '',
      dropDownContent: [],
      isSelectedItem: false,
      isAllowDropDown: false,
      placeholerValue: null,
      inputValue: '',
    };
  },

  closeDrowDown: function() {
    this.state.dropDownContent = []; // Все равно App компонент будер ререндериться
  },

  handleInput: function(e) {
    if(!e.target.value) return;

    var
      self = this,
      apiUrl = GIT_REPO_SEARCH_API(e.target.value);

    // Clear timeout id for delay
    if(this.state.timeoutId) {
      clearTimeout(this.state.timeoutId);
      this.state.timeoutId = null;
    }

    // Set request delay
    this.state.timeoutId = setTimeout(function () {
      fetch(apiUrl) // Fetch API instead raw xhr !
        .then(function(res) {
          return res.json();
        })
        .then(function(res) { // Success handler
          self.setState({
            dropDownContent: res.items.slice(0, self.props.amountRequestResult - 1),
          })
        })
        .catch(function(err) { // Error handler
          console.error(err);
        });
    }, this.props.requestDelay);
  },

  handlerFocus: function() {
    this.setState({ isAllowDropDown: true });
  },

  handlerBlur: function(e) {
    this.setState({ isAllowDropDown: false });
  },

  // Decorator for App.handlerSelectRepo fn
  handlerSelectRepo: function() {
    this.setState({ placeholerValue: null });
    this.props.handlerSelectRepo();
  },

  render: function() {
    var state = this.state;

    var dropDownContent =
      state.isAllowDropDown && state.dropDownContent.length
      ? this.renderDrowDown()
      : null;

    var classes = classNames({
      'repo-select': true,
      'repo-select--open': dropDownContent,
    });

    return (
      <div className={ classes }>
        { this.renderSelect() }
        { dropDownContent }
      </div>
    );
  },

  renderSelect: function() {
    var firstItemsValue = null;

    if(
      this.state.isAllowDropDown &&
      // this.state.selectedItem &&
      this.state.dropDownContent.length)
    {
      this.state.placeholerValue = this.state.dropDownContent[0].name;
    } else {
      this.state.placeholerValue = null;
    }

    return (
      <div className="repo-select__select form-group">
        <input
          ref="repo_name"
          className="form-control"
          value={ this.state.value }
          onInput={ this.handleInput }
          onFocus={ this.handlerFocus }
          onBlur={ this.handlerBlur }
          placeholder="Search Repositories"
        />
        <span className="repo-select__select__autocomplete-placeholer">{ this.state.placeholerValue }</span>
        <span className="repo-select__select__community-name">{ this.props.communityName }</span>
      </div>
    )
  },

  renderDrowDown: function() {
    var items = this.state.dropDownContent.map(function(repo, index) {
      return (<GitRepoSelectItem
          key={ index }
          repo={ repo }
          repoNameInput={ this.refs.repo_name }
          handlerSelectRepo={ this.handlerSelectRepo }
        />);
    }.bind(this));

    return (
      <div className="repo-select__dropdown">
        { items }
      </div>
    )
  },

});

// Stupid children component
var GitRepoSelectItem = React.createClass({

  handlerClick: function() {
    this.props.repoNameInput.value = this.props.repo.name;
    this.props.handlerSelectRepo(this.props.repo);
  },

  render: function() {
    var repo = this.props.repo;

    return (
      <div className="repo-select__dropdown__item" onMouseDown={ this.handlerClick }>
        <div>{ repo.name } &#8226; <b>{ repo.language }</b></div>
        <div className="repo-select__dropdown__item__desc">{ repo.description }</div>
      </div>
    )
  },

});

// Stupid component
var GitRepoInfo = React.createClass({

  render: function() {
    if(!this.props.repo) return null;

    var repo = this.props.repo;

    return (
      <div className="repo-info">
        <div className="repo-select__row">
          <div className="repo-select__col">Full Name:</div>
          <div className="repo-select__col">{ repo.full_name }</div>
        </div>

        <div className="repo-select__row">
          <div className="repo-select__col">Description:</div>
          <div className="repo-select__col">{ repo.description }</div>
        </div>

        <div className="repo-select__row">
          <div className="repo-select__col">Language:</div>
          <div className="repo-select__col">{ repo.language }</div>
        </div>

        <div className="repo-select__row">
          <div className="repo-select__col">Link:</div>
          <div className="repo-select__col">
            <a href={ repo.html_url } target="_blank">{ repo.html_url }</a>
          </div>
        </div>
      </div>
    );
  }

});

// Container (smart component)
var App = React.createClass({

  getInitialState: function() {
    return {
      selectedRepo: null,
    };
  },

  handlerSelectRepo: function(repo) {
    this.setState({ selectedRepo: repo });
  },

  render: function() {
    return (
      <div>
        <GitRepoSelect
          amountRequestResult={ 3 }
          communityScopeCode={ 'reactjs' }
          handlerSelectRepo={ this.handlerSelectRepo }
        />
        <GitRepoInfo repo={ this.state.selectedRepo } />
      </div>
    );
  }

});

ReactDOM.render(
  <App />,
  document.getElementById('content')
);
