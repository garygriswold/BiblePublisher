/**
* This class is the database adapter for the verses table
*/
function VersesAdapter(database) {
	this.database = database;
	this.className = 'VersesAdapter';
	Object.freeze(this);
}
VersesAdapter.prototype.drop = function(callback) {
	this.database.executeDDL('drop table if exists verses', function(err) {
		if (err instanceof IOError) {
			callback(err);
		} else {
			callback();
		}
	});
};
VersesAdapter.prototype.create = function(callback) {
	var statement = 'create table if not exists verses(' +
		'sequence integer not null primary key,' +
		'reference text not null, ' +
		'xml text not null, ' +
		'html text not null)';
	this.database.executeDDL(statement, function(err) {
		if (err instanceof IOError) {
			callback(err);
		} else {
			callback();
		}
	});
};
VersesAdapter.prototype.load = function(array, callback) {
	var uniqueTest = new Map();
	var priorVerse = null;
	for (var i=0; i<array.length; i++) {
		const key = array[i][0];
		if (uniqueTest.has(key)) {
			console.log('Duplicate verse reference ' + key + ' after ' + uniqueTest.get(key) + ' and ' + priorVerse);
		}
		uniqueTest.set(key, priorVerse);
		priorVerse = key;
	}
	var statement = 'insert into verses(reference, xml, html) values (?,?,?)';
	this.database.bulkExecuteDML(statement, array, function(count) {
		if (count instanceof IOError) {
			callback(count);
		} else {
			console.log('load verses success, rowcount', count);
			callback();
		}
	});
};
VersesAdapter.prototype.getVerses = function(values, callback) {
	var that = this;
	var numValues = values.length || 0;
	var array = [numValues];
	for (var i=0; i<numValues; i++) {
		array[i] = '?';
	}
	var statement = 'select reference, html from verses where reference in (' + array.join(',') + ') order by rowid';
	this.database.selectSSIF(statement, values, function(results) {
		if (results instanceof IOError) {
			console.log('VersesAdapter select found Error', results);
			callback(results);
		} else {
			if (results.length < 3) {
				callback(new IOError({code: 0, message: 'No Rows Found'}));// Is this really an error?
			} else {
				callback(results);
        	}
        }
	});
};
