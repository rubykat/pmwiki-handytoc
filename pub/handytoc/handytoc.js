/*
 * Javascript table-of-contents
 * Based on the script by
 * at http://cf-bill.blogspot.com/2005/09/javascript-build-toc.html
 */
function TagDetail () {
    this.name = '';
    this.num = '';
    this.value = '';
    this.level = '';
}

function TocData () {
    this.toc_start_at = 1;
    this.toc_end_at = 6;
    this.ignoreh1 = true;
}

TocData.prototype.set_args = function(args) {
    if (typeof args.start != "undefined") {
	this.toc_start_at = args.start;
    }
    if (typeof args.end != "undefined") {
	this.toc_end_at = args.end;
    }
    if (typeof args.ignoreh1 != "undefined") {
	this.ignoreh1 = args.ignoreh1;
    }
}

TocData.prototype.make_a_toc = function() {

    // because IE can't handle more than 6 levels; make sure the user hasn't
    // exceeded that amount if you remove this and use IE the script will no
    // longer work if you have invalid H7 tags and beyond.
    if(this.toc_end_at > 6){
	this.toc_end_at = 6;
    }
    var toc_container = getObjectRefByID('htoc');
    if (!toc_container) {
	// if there's no container for the ToC, then forget it.
	return;
    }
    // If there's only one h1 tag and we want to ignore sole h1 tags,
    // or if there's no h1 tags, then start the ToC at level 2
    // We're only interested in h1 inside #wikitext
    var h1_tags = document.getElementsByTagName("h1");
    var h1_count = 0;
    for(var h1i=0; h1i<h1_tags.length; h1i++){
	if ( (h1_tags[h1i].parentNode.id == 'wikitext')
	     || (h1_tags[h1i].parentNode.parentNode.id == 'wikitext'))
	{
	    h1_count++;
	}
    }
    if ((this.ignoreh1 && h1_count == 1) || h1_count == 0 ) {
	this.toc_start_at = 2;
    }

    this.toc_tag_list = '';

    //Build a list of the header tags
    for(var h=this.toc_start_at; h<=this.toc_end_at; h++){
	this.toc_tag_list = this.toc_tag_list + 'H' + h + ',';
    }

    //create an array of those tags
    this.toc_tag_array = this.toc_tag_list.split(',');

    // get the id=wikitext div to look in, otherwise the body
    var content_el = getObjectRefByID('wikitext');
    if (!content_el)
    {
	content_el = document.getElementsByTagName("body")[0];
    }
    var bodykids = content_el.childNodes;

    this.tag_num = 0;
    this.tag_detail = new Array(1);
    this.get_header_details(bodykids);

    this.toc_build(toc_container);

} //TocData.make_a_toc

TocData.prototype.get_header_details = function(tags) {

    var a_node;
    // go through the given list of tags
    for(var ti=0; ti < tags.length; ti++){
	if (this.toc_tag_list.indexOf(tags[ti].tagName+',') != -1){

	    // this is used to buid the nested lists later
	    this.current_level = this.toc_tag_array.find(tags[ti].tagName);

	    //build a unique anchor to embed with the section header
	    a_node = document.createElement('a');
	    a_node.id = 'tocLink'+this.tag_num;
	    tags[ti].appendChild(a_node);


	    // collect some details about the section that we can use to build the ToC with
	    this.tag_detail[this.tag_num] = new TagDetail();
	    this.tag_detail[this.tag_num].name = tags[ti].tagName;
	    this.tag_detail[this.tag_num].num = this.tag_num;
	    this.tag_detail[this.tag_num].level = this.current_level;

	    this.tag_detail[this.tag_num].value = getInnerText(tags[ti],1);

	    this.tag_num++; // used to keep track of how many headers we have found. 
	}
	// check for nested tags
	else if (tags[ti].hasChildNodes
	    && tags[ti].id != 'htoc') {
	    var kids = tags[ti].childNodes;
	    this.get_header_details(kids);
	}
    }
} //TocData.get_header_details

TocData.prototype.toc_build = function (toc){

    var lastLevelNum = -1;
    var currentLevelNum = 0;
    var currentParent = toc;
    var lastObject = currentParent;
    var this_detail;

    for(var i = 0; i < this.tag_detail.length; i++) {
	this_detail = this.tag_detail[i];

	currentLevelNum = this_detail.level;

	// created a nested unordered list..
	if(currentLevelNum > lastLevelNum){
	    var levelDiff = currentLevelNum - lastLevelNum;
	    for(ldi=0;ldi<levelDiff;ldi++){
		if (ldi > 0)
		{
		    var liNode = document.createElement("li");
		    currentParent.appendChild(liNode);
		    currentParent = liNode;
		    liNode.className = "HTOCspacer";
		    lastObject = liNode;
		}
		var ulNode = document.createElement("ul");
		if (currentParent.lastChild
		    && currentParent.lastChild.nodeName == 'LI')
		{
		    currentParent.lastChild.appendChild(ulNode);
		}
		else
		{
		    currentParent.appendChild(ulNode);
		}
		currentParent = ulNode;
	    }
	}
	//move back up the DOM to the right level
	if(currentLevelNum < lastLevelNum){
	    var levelDiff = lastLevelNum - currentLevelNum;
	    for(ldi=0;ldi<levelDiff;ldi++){
		currentParent = currentParent.parentNode;
		if (currentParent.nodeName == 'LI')
		{
		    currentParent = currentParent.parentNode;
		}
	    }
	}

	//add the new ToC entry
	var liNode = this.toc_build_entry(this_detail);
	currentParent.appendChild(liNode);

	//keep track of where we are
	lastLevelNum = currentLevelNum;
	lastObject = liNode;
    }

} // TocData.toc_build


TocData.prototype.toc_build_entry = function (details){

    var liNode = document.createElement("li");
    var a_node = document.createElement("a");
    var tNode = document.createTextNode(details.value);

    // className is the same as the tag, ie: H1, H2, etc.
    liNode.className = details.name;
    a_node.className = details.name;

    //embed a link in the LI so we can jump to the correct section
    a_node.href = '#tocLink'+details.num;
    a_node.appendChild(tNode);
    liNode.appendChild(a_node);

    return liNode;

} //TocData.toc_build_entry

/************************
 HELPER FUNCTIONS
*************************/
function addEvent(elm, evType, fn, useCapture)
// addEvent and removeEvent
// cross-browser event handling for IE5+,  NS6 and Mozilla
// By Scott Andrew
{
    if (elm.addEventListener){
	elm.addEventListener(evType, fn, useCapture);
	return true;
    } else if (elm.attachEvent){
	var r = elm.attachEvent("on"+evType, fn);
	return r;
    } else {
	alert("Handler could not be added");
    }
} 


function getObjectRefByID(objectId) {
    var element = false;

    // cross-browser function to get an object given its id
    if(document.getElementById && document.getElementById(objectId)) {
	// W3C DOM
	element = document.getElementById(objectId);
    } 
    else if (document.all && document.all(objectId)) {
	// MSIE 4 DOM
	element = document.all(objectId);
    } 
    else if (document.layers && document.layers[objectId]) {
	// NN 4 DOM.. note: this won't find nested layers
	element = document.layers[objectId];
    } 

    return element;
} 

/*
 * getInnerText
 * http://www.texotela.co.uk/code/javascript/
 */
function getInnerText(node,ignorewhitespace)
{
    var text = "";
    // if the node has children, loop through them
    if(node.hasChildNodes())
    {
	var children = node.childNodes;
	for(var i=0; i<children.length; i++)
	{
	    // if node is a text node append it
	    if(children[i].nodeName == "#text")
	    {
		if(ignorewhitespace)
		{
		    if(!/^\s+$/.test(children[i].nodeValue))
		    {
			text = text.concat(children[i].nodeValue);
		    }
		}
		else
		{
		    text = text.concat(children[i].nodeValue);
		}
	    }
	    // if node is a line break append \n
	    else if(children[i].nodeName == "BR")
	    {
		text = text.concat("\n");
	    }
	    // otherwise call this function again to get the text
	    else
	    {
		text = text.concat(getInnerText(children[i],ignorewhitespace));
	    }
	}
    }
    // it has no children, so get the text
    else
    {
	// if node is a text node append it
	if(node.nodeName == "#text")
	{
	    text = text.concat(node.nodeValue);
	}
	// if node is a line break append \n
	else if(node.nodeName == "BR")
	{
	    text = text.concat("\n");
	}
    }
    return text;
}

if(Array.prototype.find){
    Array.prototype.find= null;
}
if(!Array.prototype.find) {
    function ArrayFind(value){
	// simply add the element to the end of the array changing the arrays
	// length by +1
	var index = -1;
	for(var i=0; i<this.length;i++){
	    if(this[i] == value){
		index = i;
		break;
	    }
	}
	return index;
    }
    // set the Arrays push method equal to our ArrayPush function
    Array.prototype.find = ArrayFind;
} 

var TOC = new TocData();

// builds the ToC when the page is loaded.
function tocInit() {
    TOC.make_a_toc();
}
addEvent(window, "load", tocInit);
