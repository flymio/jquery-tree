function bmlTreeCookie() {
	if (document.cookie.length) { this.cookies = ' ' + document.cookie; }
}

bmlTreeCookie.prototype.setCookie = function (key, value) {
	document.cookie = key + "=" + escape(value);
}

bmlTreeCookie.prototype.getCookie = function (key) {
	if (this.cookies) {
		var start = this.cookies.indexOf(' ' + key + '=');
		if (start == -1) { return null; }
		var end = this.cookies.indexOf(";", start);
		if (end == -1) { end = this.cookies.length; }
		end -= start;
		var cookie = this.cookies.substr(start,end);
		return unescape(cookie.substr(cookie.indexOf('=') + 1, cookie.length - cookie.indexOf('=') + 1));
	}
	else { return null; }
}

var bmlTreeConfig = {
	rootIcon        : '/img/tree/folderopen.gif',
	sortnumber	: 0,
	openRootIcon    : '/img/tree/folderopen.gif',
	folderIcon      : '/img/tree/folderopen.gif',
	openFolderIcon  : '/img/tree/folderopen.gif',
	fileIcon        : '/img/tree/file.png',
	iIcon           : '/img/tree/I.gif',
	lIcon           : '/img/tree/L.gif',
	lMinusIcon      : '/img/tree/Lminus.gif',
	lPlusIcon       : '/img/tree/Lplus.gif',
	tIcon           : '/img/tree/T.gif',
	tMinusIcon      : '/img/tree/Tminus.gif',
	tPlusIcon       : '/img/tree/Tplus.gif',
	blankIcon       : '/img/tree/blank.png',
	defaultText     : 'Tree Item',
	defaultAction   : 'javascript:void(0);',
	defaultBehavior : 'classic',
	usePersistence	: true,
	cHide			: 'style="display:none"',
	cShow			: '',
	idPrefix  : "bml-tree-object-",
	idCounter : 0,
	selected  : null,
	onSelect  : null,
	maxColumn: 0,
	sortByid: 0,
	all       : {},
	cookies   : new bmlTreeCookie(),
	getId     : function(obj) {
	 	if (obj.idPrefix){
	 		return obj.idPrefix + this.idCounter++; 
	 	}
	 	return this.idPrefix + this.idCounter++; 
	},

	toggle    : function (oItem) { this.all[oItem.id.replace('-plus','')].toggle(); },
	select    : function (oItem) { this.all[oItem.id.replace('-icon','')].select(); },
	focus     : function (oItem) { this.all[oItem.id.replace('-anchor','')].focus(); },
	blur      : function (oItem) { this.all[oItem.id.replace('-anchor','')].blur(); },
	keydown   : function (oItem, e) { return this.all[oItem.id].keydown(e.keyCode); }
};

var bmlTreeNodes = new Object;


function bmlTree(obj)
{
	this.config={
		defaultColumnName: 'Column Default',
		defaultColumnWidth: '200',
		idPrefix: bmlTreeConfig.idPrefix,
		idCounter: bmlTreeConfig.idCounter
	};
	this.rendered = false;
	this.childNodes = [];
	this._last = true;
	this.id = 0;
	if (obj)
	{
		this.name = obj['name'];
		this.columns = {};
		this.basecolumn = obj['basecolumn'];
		if (obj['idPrefix'])
		{
			this.config.idPrefix = obj['idPrefix'];
		}
		var count = 0;
		if (obj['columns'])
		{
			this.columns = {};
			for (var name in obj['columns']) {
				count++;
				this.columns[name]={};
				this.columns[name]['n']=obj['columns'][name]['n'];
				this.columns[name]['w']=obj['columns'][name]['w'];
			}
			bmlTreeConfig.maxColumn = count;
			this.text   = this.columns[this.basecolumn]['n'];
		}
	}	
}

bmlTree.prototype.find = function(pattern)
{
	if (bmlTreeNodes[pattern]){
		return bmlTreeNodes[pattern];
	}
	var el = $(pattern).eq(0);
	var id = $(el).attr("id");
	id=id.replace(this.config.idPrefix,"");
	id=id.replace(/-(.+?)$/,"");
	if (id)
	{
		return bmlTreeNodes[this.config.idPrefix+id];
	}
}
bmlTree.prototype.add = function(node){
	this.childNodes[this.childNodes.length] = node;
	
	bmlTreeNodes[node.id]=node;	
	
	node.basename = this.name;
	node.parentNode = this;
}
bmlTree.prototype.toString = function(){

	var str = "<div class=tree-container_ style='display:block'>";
	var cnt = 0;
	var cl = {};
	var w = 0;
	var _wx = 'px';
	for(var pars in this.columns)
	{
		cnt++;
		str+="<div class=tree-columns id=column_"+cnt+" style='width:"+this.columns[pars]['w']+";height:18px;'>"+this.columns[pars]['n']+"</div>";
		this.columns[pars]['w'] = this.columns[pars]['w']+"";
		if (this.columns[pars]['w'].match('%')){
			_wx = "%";
		}
		w+=parseInt(this.columns[pars]['w']);
		cl[cnt]=this.columns[pars]['w'];
	}
	w+=_wx;
	str+="<br clear='all' /><div class=tree-container style='display:block'>";
	var sb = [];
	for (var i = 0; i < this.childNodes.length; i++) {
		sb[i] = this.childNodes[i].toString(i, this.childNodes.length,this.basecolumn,cl,w);
	}
	this.rendered = true;
	return sb.join("");
}
function bmlItem(tree,obj,params){
	this.id = bmlTreeConfig.getId(tree.config);
	this.tree = tree;
	this.params = params;
	this.childNodes = [];
	this.name = obj['name'];
	this.openIcon = bmlTreeConfig.openFolderIcon;
	this.icon = bmlTreeConfig.folderIcon;
	this._last = true;
	this.folder = 0;
	this.open = obj.open || true;
	this.tagName = "a";
	this.tagClosed = true;
	this.className = 'b-anchor-link';
	if (obj.tagName)
	{
		this.tagName=obj.tagName;
		this.tagClosed = obj.tagClosed ? obj.tagClosed : true;
	}
	if (obj.className){
		this.className+=" "+obj.className;
	}
	this.ms = new Array();
	if (obj)
	{
		this.columns = {};
		if (obj['columns'])
		{
			this.columns = {};
			for (var name=1;name<=bmlTreeConfig.maxColumn;name++) {
				this.columns[name]={};
				if (!obj['columns'][name]){obj['columns'][name]={};obj['columns'][name]['n']=""}
				this.columns[name]['n']=obj['columns'][name]['n']||"";
				this.ms[name-1]=obj['columns'][name]['n']||"";
				if ( obj['columns'][name]['io'] ) {
					this.openIcon = obj['columns'][name]['io']
				}
				if ( obj['columns'][name]['ic'] ) {
					this.icon = obj['columns'][name]['ic']
				}
				if ( obj['columns'][name]['it'] ) {
					this.iconTag = obj['columns'][name]['it']['tag'];
					this.iconTagParams="";
					for(var s in obj['columns'][name]['it'])
					{
						this.iconTagParams+=" "+s+"='"+obj['columns'][name]['it'][s]+"'";
					}
				}
			}
		}
	}
	if (bmlTreeConfig.usePersistence) {
		this.open  = true;//(bmlTreeConfig.cookies.getCookie("s"+this.id.substr(this.tree.config.idPrefix.length,this.id.length - this.tree.config.idPrefix.length)) == '1')?true:false;
	}
	bmlTreeConfig.all[this.id] = this;
}
bmlItem.prototype.toString = function(curlevel,level,basecount,cl,w,s)
{
	var str = "";
	if (!s){
		str = "<div id='"+this.id+"-base' style='width:"+w+";' class='mioland'>\n";
	}
	var indent = '';
	this.basecolumn = basecount;
	this.cl = cl;
	this.w = w;
	this.rendered = true;
	if (!this.childNodes.length){
		this.folder = false;
	}
	if (this.open && this.childNodes.lenght<1)
	{
		this.open = true;//false;
	}
	if (this.parentNode)
	{
		var foo = this.parentNode;
		//if (curlevel + 1 == level) { this.parentNode._last = true; }
		var i = 0;
		while (foo.parentNode) {
			i++;
//			indent = "<img id=\"" + this.id + "-indent-" + i + "\" src=\"" + ((foo._last)?bmlTreeConfig.blankIcon:bmlTreeConfig.iIcon) + "\">" + " ["+foo.id+"="+foo._last +"] "+ indent;
			indent = "<img id=\"" + this.id + "-indent-" + i + "\" src=\"" + ((foo._last)?bmlTreeConfig.blankIcon:bmlTreeConfig.iIcon) + "\">" + indent;
			foo = foo.parentNode;
		}
	}
	if (this.childNodes.length) { this.folder = 1; }

	this.plusIcon = ((!this._last)?bmlTreeConfig.tPlusIcon:bmlTreeConfig.lPlusIcon);
	this.minusIcon = ((!this._last)?bmlTreeConfig.tMinusIcon:bmlTreeConfig.lMinusIcon);

	if (!basecount){basecount = 1;}
	var cnt = 0;
	str+="<div class='item-deselect' id='"+this.id+"-item' style='width:"+w+";height:18px;'>\n\n";
	for(var name in this.columns)
	{
		cnt++;
		if (cnt == basecount)
		{
			var params = "";
			if (!this.params['href'])
			{
				this.params['href']='javascript:void(0)';
			}
			if (this.params){
				for (p in this.params){
					params+=" "+p+"='"+this.params[p]+"'";
				}
			}

			this.iconRender = '<i class="icon-folder-close icon-red"></i>';
/*			if (this.iconTagParams)
			{
				this.iconRender = "<" + this.iconTag + this.iconTagParams + "onclick=\"return true\">";
			}
			else{
				this.iconRender = "<img id=\"" + this.id + "-icon\" class=\"tree-icon\" src=\"" + ((this.open)?this.openIcon:this.icon) + "\" onclick=\"bmlTreeConfig.select(this);\">";
			}

			*/
			str+="\t<div class='tree-item tree-item-column-"+cnt+"' id='"+this.id+"' style='width:"+cl[cnt]+";overflow:hidden;' ondragstart=\"return false\" onkeydown=\"return bmlTreeConfig.keydown(this, event)\">\n"+indent +
		"<img id=\"" + this.id + "-plus\" src=\"" + ((this.folder)?((this.open)?((this._last)?bmlTreeConfig.lMinusIcon:bmlTreeConfig.tMinusIcon):((this._last)?bmlTreeConfig.lPlusIcon:bmlTreeConfig.tPlusIcon)):((curlevel==level-1||level==1||curlevel>(level-1))?bmlTreeConfig.lIcon:bmlTreeConfig.tIcon)) + "\" onclick=\"bmlTreeConfig.toggle(this);\">\n" + this.iconRender+
		"<"+this.tagName+" onfocus=\"bmlTreeConfig.focus(this);\" onblur=\"bmlTreeConfig.blur(this);\" id='"+this.id+"-anchor' class='"+this.className+"'"+params+">" +this.columns[name]['n']+"</"+this.tagName+"></div>";
		}
		else{
			str+="<div class='tree-item tree-item-column-"+cnt+"' id='"+this.id+"-column-"+cnt+"' style='width:"+cl[cnt]+"'>"+this.columns[name]['n']+"</div>\n";
		}
	}
	str+="</div>\n";
	str+="<div class=tree-container id='"+this.id+"-container' "+(this.open?bmlTreeConfig.cShow:bmlTreeConfig.cHide)+">\n";
	var sb = [];
	for (var i = 0; i < this.childNodes.length; i++) {
		str += this.childNodes[i].toString(i, this.childNodes.length,basecount,cl,w,0);
	}
	str+="</div>\n";
	if (!s){
		str+="</div>\n";
	}
	return str;
}
bmlItem.prototype.toggle = function()
{
	if (this.folder) {
		if (this.open) { this.collapse(); }
		else { this.expand(); }
	}	
}
bmlItem.prototype.expand = function() {
	this.doExpand();
	document.getElementById(this.id + '-plus').src = this.minusIcon;
}

bmlItem.prototype.doExpand = function() {
	if (document.getElementById(this.id + '-icon')){
		document.getElementById(this.id + '-icon').src = this.openIcon;
	}
	if (this.childNodes.length) {  document.getElementById(this.id + '-container').style.display = 'block'; }
	this.open = true;
	if (bmlTreeConfig.usePersistence) {
		bmlTreeConfig.cookies.setCookie("s"+this.id.substr(this.tree.config.idPrefix.length,this.id.length - this.tree.config.idPrefix.length), '1');
	}
}

bmlItem.prototype.collapse = function(b) {
	if (!b) { this.focus(); }
	this.doCollapse();
	if (this.childNodes.length>0){
		document.getElementById(this.id + '-plus').src = this.plusIcon;
	}
}

bmlItem.prototype.doCollapse = function() {
	if (document.getElementById(this.id + '-icon')){
		document.getElementById(this.id + '-icon').src = this.icon;
	}
	if (this.childNodes.length) { document.getElementById(this.id + '-container').style.display = 'none'; }
	this.open = false;
	if (bmlTreeConfig.usePersistence) {
		bmlTreeConfig.cookies.setCookie("s"+this.id.substr(this.tree.config.idPrefix.length,this.id.length - this.tree.config.idPrefix.length), '0');
}	}


bmlItem.prototype.deSelect = function() {
	$("#"+this.id + '-anchor').removeClass("selected-inactive");
	$("#"+this.id + '-item').addClass("item-deselect");
	bmlTreeConfig.selected = null;
}

bmlItem.prototype.select = function() {
	document.getElementById(this.id + '-anchor').focus();
}

bmlItem.prototype.blur = function() {
	if (this.openIcon) { if (document.getElementById(this.id + '-icon')){
		document.getElementById(this.id + '-icon').src = this.icon;
	}};
	$("#"+this.id + '-anchor').addClass("selected-inactive").removeClass("selected");
	$("#"+this.id + '-item').addClass("item-inactive");
}

bmlItem.prototype.focus = function() {
	if ((bmlTreeConfig.selected) && (bmlTreeConfig.selected != this)) { bmlTreeConfig.selected.deSelect(); }
	bmlTreeConfig.selected = this;
	if ((this.openIcon)) { if (document.getElementById(this.id + '-icon')){
		document.getElementById(this.id + '-icon').src = this.openIcon; 
	}}
	//$("#"+this.id + '-anchor').focus();
	$("#"+this.id + '-anchor').addClass("selected");
/*
	if (!$("#"+this.id + '-item').hasClass("item-selected"))
	{
		$(".item-selected").removeClass("item-selected");
		$("#"+this.id + '-item').addClass("item-selected");
	}
	if (!$("#"+this.id + "-item").hasClass("selectedLine")){
		$("#"+this.id + '-base').trigger("mousedown");
	}
*/
	return true;
}

bmlItem.prototype.add = function(node)
{
	node.parentNode = this;
	node.basename = this.basename;
	this.childNodes[this.childNodes.length] = node;
	if (this.childNodes.length >= 2) {
		var obj = this.childNodes[this.childNodes.length - 2];
		obj._last = false;
	}
	node._last = true;
	bmlTreeNodes[node.id]=node;

	if (this.rendered)
	{
		this.childNodes[this.childNodes.length - 1]._last = true;

		document.getElementById(this.id+"-container").innerHTML+=node.toString(this.childNodes.length-1,this.childNodes.length-1,this.basecolumn,this.cl,this.w);
		document.getElementById(this.id+"-container").style.display='block';

		document.getElementById(this.id+"-plus").src=(this._last?'/img/tree/Lminus.gif':'/img/tree/Tminus.gif');
		this.folder=true;
		this.open=true;
		if (this.childNodes.length >= 2) {
			this.childNodes[this.childNodes.length - 2]._last = false;
			var prevSiblingId = this.childNodes[this.childNodes.length - 2].id;
			document.getElementById(prevSiblingId+"-plus").src=document.getElementById(prevSiblingId+"-plus").src.replace(bmlTreeConfig.lIcon,bmlTreeConfig.tIcon);
			var new_node = this.childNodes[this.childNodes.length - 2];
			new_node._last=false;
			//document.getElementById(new_node.id+"-base").innerHTML = new_node.toString(this.childNodes.length-2,this.childNodes.length-1,new_node.basecolumn,new_node.cl,new_node.w,1);
		}

	}
	return node;
}

bmlItem.prototype.remove = function(node)
{
	if (node)
	{
		var item_from_id = 0;
		var cnt = 0;
		for (var i = 0; i < this.childNodes.length; i++) {
			if (this.childNodes[i]==node)
			{
				var id = document.getElementById(this.childNodes[i].id+"-base");
				id.parentNode.removeChild(id);
				item_from_id = i;
			}
		}
		for (var i=item_from_id; i< this.childNodes.length-1; i++ )
		{
			this.childNodes[i]=this.childNodes[i+1];
		}
		var nothing = this.childNodes.pop();
		nothing = null;
		
		if (this.childNodes.length<1)
		{
			this.open = false;
			this.folder = false;
			container_id = document.getElementById(this.id+"-container");
			if (container_id)
			{
				container_id.style.display='none';
				document.getElementById(this.id+"-plus").src=(this._last?bmlTreeConfig.lIcon:bmlTreeConfig.tIcon);
			}
		}
		else{
			if (this.childNodes.length==1)
			{
				this.childNodes[0]._last = 1;
				document.getElementById(this.id+"-base").innerHTML = this.toString(this.childNodes.length-1,this.childNodes.length-1,this.basecolumn,this.cl,this.w);
			
			}
			else{
				var node_last = this.childNodes[this.childNodes.length-1];
				node_last._last=true;
				if (node._last){
					document.getElementById(node_last.id+"-plus").src=(node_last._last?bmlTreeConfig.lIcon:bmlTreeConfig.tIcon);
					document.getElementById(node_last.id+"-base").innerHTML = node_last.toString(node_last.childNodes.length-1,node_last.childNodes.length-1,node_last.basecolumn,node_last.cl,node_last.w,1);				
				}
				
			}
		}
	}
	else{
		this.parentNode.remove(this);
	}
}
bmlItem.prototype.down = function()
{
	var node_from = this.parentNode;
	if (node_from)
	{

		var item_from_id = 0;
		for (var i = 0; i < node_from.childNodes.length; i++) {
			if (node_from.childNodes[i]==this)
			{
				var temp_obj = this;
				if (node_from.childNodes[i+1]){
					node_from.childNodes[i]=node_from.childNodes[i+1];
					var _c = node_from.childNodes[i].columns[2];
					node_from.childNodes[i].columns[2]=this.columns[2];
					node_from.childNodes[i+1]=this;
					node_from.childNodes[i+1].columns[2]=_c;
					node_from.childNodes[i+1].prev=node_from.childNodes[i];
					if (i>1)
					{
						node_from.childNodes[i].prev=node_from.childNodes[i-1];
					}
					if (i+1 == node_from.childNodes.length-1)
					{
						node_from.childNodes[i+1]._last = true;
						var node_prev = node_from.childNodes[i+1].prev;
						node_prev._last = false;						
					}
					document.getElementById(node_from.id+"-base").innerHTML=node_from.toString(1,1,node_from.basecolumn,node_from.cl,node_from.w,1);
					return;
				}
			}
		}
			
	}
}

bmlItem.prototype.up = function()
{
	var node_from = this.parentNode;
	if (node_from)
	{

		var item_from_id = 0;
		for (var i = 0; i < node_from.childNodes.length; i++) {
			if (node_from.childNodes[i]==this)
			{
				var temp_obj = this;
				temp_obj._last = false;
				if (node_from.childNodes[i-1]){
					node_from.childNodes[i]=node_from.childNodes[i-1];
					var _c = node_from.childNodes[i].columns[2];
					node_from.childNodes[i].columns[2]=this.columns[2];
					node_from.childNodes[i-1]=this;
					node_from.childNodes[i-1].columns[2]=_c;
					node_from.childNodes[i-1].prev=node_from.childNodes[i];
					if (i>2)
					{
						node_from.childNodes[i].prev=node_from.childNodes[i-1];
					}
					
					document.getElementById(node_from.id+"-base").innerHTML=node_from.toString(1,1,node_from.basecolumn,node_from.cl,node_from.w,1);
				}
			}
		}
			
	}
}

bmlItem.prototype.move = function(node_to,type)
{
	var node_from = this.parentNode;
	if (node_from)
	{
		var item_from_id = 0;
		for (var i = 0; i < node_from.childNodes.length; i++) {
			if (node_from.childNodes[i]==this)
			{
				var id = document.getElementById(node_from.childNodes[i].id+"-base");
				id.parentNode.removeChild(id);
				this.parentNode=node_to;
				if (i>0){
					this.prev = node_from.childNodes[i-1];
				}
				item_from_id = i;
			}
		}
		if (this.childNodes.length>0)
		{	
			for (var i=0; i< this.childNodes.length-1; i++ )
			{
				this.childNodes[i].rendered = false;
			}			
		}
		for (var i=item_from_id; i< node_from.childNodes.length-1; i++ )
		{
			node_from.childNodes[i]=node_from.childNodes[i+1];
		}
		var nothing = node_from.childNodes.pop();
		nothing = null;
		if (node_from.childNodes.length<1)
		{
			node_from.open = false;
			node_from.folder = false;
			container_id = document.getElementById(node_from.id+"-container");
			if (container_id)
			{
				container_id.style.display='none';
				document.getElementById(node_from.id+"-plus").src=(node_from._last?bmlTreeConfig.lIcon:bmlTreeConfig.tIcon);
			}
		}
		var next = node_from.getNextSibling() || null;
		var prev = this.prev;
		if (!next){
			if (prev){
				prev._last = true;
				prev.rendered = false;
				var str = "";
				prev.cl = prev.parentNode.cl;
				document.getElementById(prev.id+"-base").innerHTML=prev.toString(prev.childNodes.length-1,prev.childNodes.length-1,prev.basecolumn,prev.cl,prev.w,1);
			}
			
		}
		if (node_to)
		{
			var childs = node_to.childNodes.length;
			var current = childs+1;
			var str = "";
			node_to.add(this);
			document.getElementById(node_to.id+"-base").innerHTML=node_to.toString(1,1,node_to.basecolumn,node_to.cl,node_to.w,1);
		}
	}
}

function insertAfter(parent, node, referenceNode) {
  parent.insertBefore(node, referenceNode.nextSibling);
}
bmlItem.prototype.getFirst = function() {
	return this.childNodes[0];
}

bmlItem.prototype.getLast = function() {
	if (this.childNodes[this.childNodes.length - 1] && this.childNodes[this.childNodes.length - 1].open && this.childNodes[this.childNodes.length - 1].length>0) { return this.childNodes[this.childNodes.length - 1].getLast(); }
	else { 
		return this.childNodes[this.childNodes.length - 1]; 
	}
}
bmlItem.prototype.getNextSibling = function() {
	
	if (this.id.replace(this.tree.config.idPrefix,"")==this.tree.config.idCounter)
	{return;}
	for (var i = 0; i < this.parentNode.childNodes.length; i++) {
		if (this == this.parentNode.childNodes[i]) { break; }
	}
	if (this.parentNode.childNodes.length<=0){return}	
	if (++i == this.parentNode.childNodes.length && this.parentNode.id != 0) { return this.parentNode.getNextSibling(); }
	else { return this.parentNode.childNodes[i]; }
}

bmlItem.prototype.getPreviousSibling1 = function(b) {
	if (this.id.replace(this.tree.config.idPrefix,"")==0)
	{
		return false;
	}
	for (var i = 0; i < this.parentNode.childNodes.length; i++) {
		if (this == this.parentNode.childNodes[i]) {break; }
	}
	if (i == 0) { return this.parentNode; }
	else {
		if ((this.parentNode.childNodes[--i].open) || (b && this.parentNode.childNodes[i].childNodes.length)) { return this.parentNode.childNodes[i]; }
		else { return this.parentNode.childNodes[i]; }
	}
}

bmlItem.prototype.getPreviousSibling = function(b) {
	if (this.id.replace(this.tree.config.idPrefix,"")==0)
	{
		return false;
	}
	for (var i = 0; i < this.parentNode.childNodes.length; i++) {
		if (this == this.parentNode.childNodes[i]) { break; }
	}
		if (i == 0) { return this.parentNode; }
	else {
		if ((this.parentNode.childNodes[--i].open && this.parentNode.childNodes[i].childNodes.length) || (b && this.parentNode.childNodes[i].childNodes.length)) {
			return this.parentNode.childNodes[i].getLast();
		}
		else { return this.parentNode.childNodes[i]; }
	}
}
var _is_edit = false;
var _is_edit_object = null;
bmlItem.prototype.keydown = function(key) {
	if (_is_edit){
		if (key == 13){
			if (_is_edit_object){
				var id = _is_edit_object;
				var _val = $("#"+id+"-input").val();
				$("#"+id+"-anchor").html(_val);
				$("#"+id+"-anchor").next().remove();
				$("#"+id+"-anchor").removeClass("g-hidden").trigger("focus");	
				_is_edit=false;
			}
		}
		if (key == 27){
			if (_is_edit_object){
				var id = _is_edit_object;
				$("#"+id+"-anchor").next().remove();
				$("#"+id+"-anchor").removeClass("g-hidden").trigger("focus");	
				_is_edit=false;
			}
		}
		return true;
	}
	if (key == 9)
	{
		return true;
	}
	if (key == 113){
		var id = this.id;
		var _text = $("#"+id+"-anchor").text();
		$("#"+id+"-anchor").addClass("g-hidden").after("<input type=text id='"+id+"-input' value='"+_text+"'>");
		$("#"+id+"-input").select().focus();
		_is_edit_object = id;
		_is_edit=true;
		return false;
	}
	if ((key == 39) && (this.folder)) {
		if (!this.open) { this.expand(); }
		else { if (this.getFirst()){this.getFirst().select();} }
		return false;
	}
	else if (key == 37) {
		if (this.open) { this.collapse(); }
		else { if (this.parentNode && this.parentNode.id != 0){this.parentNode.select();} }
		return false;
	}
	else if (key == 40) {
		var s = this.id;
		s=s.replace(this.tree.config.idPrefix,"");
		if (s == bmlTreeConfig.idCounter-1 ){
			return false;
		}
		if (this.open && this.childNodes.length) {if (this.getFirst()){this.getFirst().select();return true;}else{this.select();return true;}}
		else {
			var sib = this.getNextSibling();
			if (sib) { sib.select(); return true;}else{this.select();return true;}
		}
		return false;
	}
	else if (key == 38) { 
		if (this.getPreviousSibling()){
			this.getPreviousSibling().select();
		} 
		return false; 
	}
	_dragNowYes = false;
	return true;
}

$.fn.tree = function(params) {
  return this.each(function(){
    	var name = $(this).attr("id");
    	var root = $(this).attr("root");
    	var target = $(this).attr("target");
		folder = new bmlTree({idPrefix:name,idCounter:1,name:name,basecolumn:1,columns:{1:{w:'200px'},2:{w:'100px'}}});
		var tree0 = new bmlItem(folder,{open:true,name:'main',columns:{1:{n:'root'},2:{n:'111'}}},{path:'/1/',type:'page',href:'_'});
		tree0.open=true;
		folder.add(tree0);
		tree_generate(tree0,folder,this);
		$("#"+name).wrap('<div id="'+name+'_folder"></div>');
		var el = $("#"+name+"_folder");
		document.getElementById(name+"_folder").innerHTML=folder;
		$("#b-tree0-anchor").focus();
		}
	);
 };


var _filelist = new Object;
var _treeList = new Object;
var folder;

function tree_generate(tree,folder,obj)
{
	$.each($(obj).children("li"),function(){
		var text = $(this).find(">span").html();
		var tree1;
		tree.add(tree1 = new bmlItem(folder,{open:true,name:'main',columns:{1:{n:text},2:{n:'123'}}},{path:'',type:'page',href:'',original_name:'_title'}));
		console.log($(this));
		if ($(this).children("ul"))
		{
			tree_generate(tree1,folder,$(this).children("ul"));
		}
	});
}

