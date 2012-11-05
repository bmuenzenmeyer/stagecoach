var fs = require('fs');

function getExtension(filename) {
    var i = filename.lastIndexOf('.');
    return (i < 0) ? '' : filename.substr(i + 1);
}

function getItemName(filename){
	var i = filename.lastIndexOf('.');
    return (i < 0) ? '' : filename.substr(0,i);
}

function escape (key, val) {
    if (typeof(val)!="string") return val;
    return val
      .replace(/[\n]/g, '\\n')
      .replace(/[\r]/g, '\\r')
      .replace(/[\t]/g, '\\t')
      .replace(/["]/g, '\\"')
      ;
}

function readFiles(callback){
	var items = [],
		itemDict = [],
		dir = './items/',
		obj = {},
		order;

	fs.readFile('order.txt', 'utf8', function(err, data){
		if(err){
			console.log(err);
		}
		if(data){
			order = JSON.parse(data);
		}

		fs.readdir(dir, function(err, files){
			if(err){
				console.log(err);
			}
			var i = 0;
			files.forEach(function(file){
				var item = {},
					ext = getExtension(file),
					name = getItemName(file);

				if(itemDict.indexOf(name) === -1){
					itemDict.push(name);
					item.name = name;
					items.push(item);
				}
				i++;
				fs.readFile(dir+file, 'utf8', function(err, data){
					if(err){
						console.log(err);
					}
					var index = itemDict.indexOf(name);

					if(ext === 'html'){
						items[index].html = data;
					}
					else if(ext === 'css'){
						items[index].css = data;
					}

					if(0 === --i){
						obj.items = items;
						if(order){
							order.forEach(function(slot){
								obj.items.forEach(function(item){
									if(item.name === slot.name){
										item.order = slot.order;
									}
								})
							});
						}
						console.log(obj);
						callback(JSON.stringify(obj, escape));
					}
				});
			});
		});
	});
}

function setOrder(slot){
	console.log('in setOrder')
	fs.readFile('order.txt', 'utf8', function(err, data){
		var order, alreadyExists = false;
		if(data){
			order = JSON.parse(data);
		} else{
			order = [];
		}
		order.forEach(function(oItem){
			if(oItem.name === slot.name){
				console.log('update order only');
				alreadyExists = true;
				oItem.order = slot.order;
			}
		})
		if(!alreadyExists){
			console.log('adding ' + slot.name + " " + slot.order);
			order.push(slot);
		}
		writeOrder(order);
	});
}

function writeOrder(order){
	fs.writeFile('order.txt', JSON.stringify(order), function(err){
		if(err){
			console.log(err);
		} else{
			//console.log('order written successfully');
		}
	})
}

exports.index = function(req, res){
	readFiles(function(items){
		res.render('index', { title: 'Stagecoach', items: items });
	});
};

exports.grid = function(req, res){
	res.render('grid', { title: 'Stagecoach > Grid'});
};

exports.full = function(req, res){
	var name = req.query["name"],
		html, css;
	fs.readFile('./items/'+ name + '.css', 'utf8', function(err, data){
		if(err){
			console.log(err);
		}
		css = data;
		fs.readFile('./items/'+ name + '.html', 'utf8', function(err, data){
			if(err){
				console.log(err);
			}
			html = data;
			res.render('full', {title: 'Stagecoach > ' + name, html: html, css: css});
		});
	});
};

exports.calvary = function(req, res){
	readFiles(function(items){
		res.render('calvary', {title: 'Stagecoach > Calvary', items: items});
	});
};

exports.update = function(req, res){
	var item = req.body;
	console.log('write request received for item...');
	console.log(item);

	fs.writeFile('items/' + item.name + '.html', item.html, function(err){
		if(err){
		  console.log(err);
		}
		fs.writeFile('items/' + item.name + '.css', item.css, function(err){
			if(err){
		  		console.log(err);
			}
			fs.stat('order.txt', function(err, stat) {
				var slot = {name: item.name, order: item.order};
			    if(err == null) {
			        setOrder(slot);
			    } else if(err.code == 'ENOENT') {
			        var order = [];
			        order.push(slot);
			        writeOrder(order);
			    } else {
			        console.log(err);
			    }
			});
		});
	});
};

exports.remove = function(req, res){	
	var item = req.body;

    fs.unlink('items/' + item.name + '.css', function(err){
      if(err){
        console.log(err);
      }
      fs.unlink('items/' + item.name + '.html', function(err){
        if(err){
          console.log(err);
        }
      });
    });
};