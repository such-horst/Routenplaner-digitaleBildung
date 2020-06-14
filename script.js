
var d3 = d3;
var marked = marked;

history.scrollRestoration = "manual";

var hash = window.location.hash.replace ("#", "");
if (hash.match (/^p\d+$/g)) { var init = hash; }
else if (hash != "legal") { var search = hash; }

var main = d3.select (".main");
var input = d3.select (".search input");
if (search) { input.node().value = decodeURIComponent (search); }

var live = false;
var filter = null;

function prepare () {

  var para = d3.selectAll (".main > *:not(ul):not(ol), .main > ul > li, .main > ol > li").each (function (d, i) {
    
    var node = d3.select (this).attr ("id", "p" + i).on ("click", function () {
    
      node = d3.select (this);
      var selected = node.classed ("selected");
      d3.selectAll (".selected").classed ("selected", false);
      init = d3.select (this).attr ("id");
      
      if (d3.event.target.nodeName == "A") {
        var link = d3.select (d3.event.target).attr ("href");
        
        if (!link.startsWith ("#")) {
          window.open (d3.select (d3.event.target).attr ("href"), "_blank");
          d3.event.preventDefault();
          
        } else {
          d3.event.preventDefault();
          var target = d3.select (link);
          if (!target.empty()) {

            target.classed ("selected", true);
            history.pushState (null, null, link);
            scroll (target.node());
            return;
          }
        }
      }
      
      if (d3.select ("body").classed ("result")) {
        
        node.classed ("selected", true);
        input.node().value = "";
        input.dispatch ("input");
        history.pushState (null, null, "#" + init); 
        
        para.each (function () {
          if (init == d3.select (this).attr ("id")) {
            scroll (this);
          }
        })
        
      } else {
        node.classed ("selected", !selected);

        if (selected) {
          history.pushState (null, null, '#');
        } else {
          history.pushState (null, null, '#' + init);
        }
      }
      
    });
    
    if (init && init == "p" + i) {
      node.classed ("selected", true);
      
      scroll (node.node());
    }
  })
  
  input.on ("input", () => {
    search = input.node().value;
    
    if (!d3.select ("body").classed ("result")) {
        window.scrollTo (0, 0);
    }

    d3.select ("body").classed ("result", search != "");

    if (d3.event.isTrusted) { 
      history.pushState (null, null, "#" + search); 
    }
    
    d3.selectAll (".count").remove();
    
    if (search != "") {
      para.classed ("hidden", function () {
        return !d3.select (this).text().toLowerCase().includes (search.toLowerCase());
      })
      
      d3.selectAll (".main > ul, .main > ol").each (function () {
        if (d3.select (this).selectAll ("li:not(.hidden)").empty()) {
          d3.select (this).classed ("hidden", true);
        }
      })

      var visible = para.filter (":not(.hidden)").each (function (d, i) {
        d3.select (this).append ("div").classed ("count", true).html ('#' + d3.select (this).attr ("id").replace ("p", ""));
      })
      
      d3.select ("body").classed ("empty", visible.empty());
      
    } else {
      d3.selectAll (".hidden").classed ("hidden", false);
    }
  })
  
  d3.selectAll (".clear, .small > div:nth-child(1)").on ("click", () => {
    input.node().value = "";
    input.dispatch ("input");
    window.location.hash = "";
    d3.select ("body").classed ("empty", false);
  })

  if (search) {
    input.dispatch ("input"); 
  }
    
  d3.select (document).on ('scroll', function () {
    d3.select ("body").classed ("sticky", window.pageYOffset > d3.select (".title").node().clientHeight - 60)
  });
  
  window.onhashchange = function ()
  {
    var id = window.location.hash;
    if (id.replace ("#", "") != "") {
      var target = d3.select (id);

      if (!target.empty()) {
        d3.selectAll (".selected").classed ("selected", false);
        target.classed ("selected", true);
        scroll (target.node());
        return;
      }
    }
  }

  setTimeout (() => {
    
    para.each (function () {
      if (init == d3.select (this).attr ("id")) {
        scroll (this);
      }
    })
  }, 50)
  
  d3.select ("body").classed ("sticky", window.pageYOffset > d3.select (".title").node().clientHeight - 60)
}

function scroll (node)
{
  if (node.nodeName == "HR" || node.nodeName == "H1") {
    window.scrollTo (0, node.offsetTop - 110);

  } else {
    window.scrollTo (0, node.offsetTop - (window.innerHeight - node.clientHeight) / 2);
  }
}

if (live) {
  d3.text ("https://routenplaner-digitale-bildung.glitch.me/text.md").then (text => 
  {
    text = marked (text);
    main.html (text);
    console.log (text);
    prepare();
  });

} else {
  prepare();
}