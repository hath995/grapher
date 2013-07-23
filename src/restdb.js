
function RESTDB(adapter) {
	this.database = adapter;
	this.adapterSetup = function(callback) {
		this.database.adapterSetup(callback);
	};

	this.get = function(bucket, item, callback) {
		this.database.get(bucket, item, callback);
	}
	this.put = function(bucket, item, callback) {
		this.database.put(bucket, item, callback);
	}
	this.post = function(bucket,item, callback) {
		this.database.post(bucket, item, callback);
	}	

	this.remove = function(bucket, item, callback) {
		this.database.remove(bucket, item, callback);
	}



}

/**
	@constructor
	@class
	@param {string} name The name of the index
	@param {boolean} unique Set whether index accepts duplicate key values
	@param {boolean} multipleEntries Set whether index creates multiple records for indexed key
**/
function Index(name,unique, multipleEntries) {
	this.name = name;
	this.unique = unique || false;
	this.multipleEntries = multipleEntries || false;
}

/**
	@constructor
	@class
	@param {string} name The name of the data bucket
	@param {string} key The name of the data primary key (Optional);
	@param {Index[]} indices Array of index objects
**/
function Bucket(name, key, indices) {
	this.name = name;
	this.key = key;
	this.indices = (function(indexes) {
		if(indexes !== undefined && indexes !== null) {
			return indexes;
		}else{
			return [];
		}
	})(indices);
}

function IndexedDBAdapter(databasename) {
	this.dbname = databasename;
	this.db = null;
	this.buckets = {};
	this.addBucket = function(bucket) {
		this.buckets[bucket.name] = bucket;	
	};
	this.adapterSetup = function(callback) {
		var self = this;
		var dbrequest = indexedDB.open(this.dbname);
		dbrequest.onsuccess = function() {
			console.log("DB setup successful: "+self.dbname+" opened.");
			self.db = dbrequest.result;
			callback();
		}
		dbrequest.onerror = function() {
			console.log("DB setup failed: "+self.dbname+" not opened.");
		}
		dbrequest.onupgradeneed = function() {
			console.log("DB altered structure");
			var newdb = dbrequest.result;
			for(var b in self.buckets) {
				var store = newdb.createObjectStore(self.buckets[b].name,self.buckets[b].key);
				for(var i = 0; i < self.buckets[b].indices; i++) {
					var index = self.buckets[b].indices[i];
					store.createIndex(index.name,index);
				}
			}
		}
	}

	/**
		Get some item from the specified callback
		@param {String} bucket 
	**/
	this.get = function(bucket, item, callback) {
		console.log("DB: "+bucket+" / "+item);
		if(item !== null && item !== undefined) {
			var datareq = this.db.transaction(bucket,"readonly").objectStore(bucket).get(item);
			datareq.onsuccess = function() {
				callback(datareq.result);
			}
		}else{
			var cursor = this.db.transaction(bucket,"readonly").objectStore(bucket).openCursor();
			cursor.onsuccess = function(evt) { if(evt.target.result instanceof IDBCursorWithValue) {callback(evt.target.result.value); evt.target.result.continue() }};
		}

	}

	this.post = function(bucket, item, callback) {
		if(item !== null && item !== undefined) {
			var datains = this.db.transaction(bucket,"readwrite").objectStore(bucket).add(item);
			datains.onsuccess = function(evt) { callback(evt.target.result) };
		}
	}

	this.remove = function(bucket, item, callback) {
		if(item !== null && item !== undefined) {
			var datarm = this.db.transaction(bucket,"readwrite").objectStore(bucket).delete(item);
			datarm.onsuccess = function(evt) {callback()};
		}
	}
	//var objs = db.transaction("FunctionSets","readonly").objectStore("FunctionSets").index("by_name").openKeyCursor();objs.onsuccess = function(evt) {console.log(evt.target.result.key);};

}
