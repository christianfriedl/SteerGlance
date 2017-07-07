* tests for DefaultController should test whether the enitty was actually saved -- TODO;prio-1
* currently there is no config object -- TODO;milestone:v0.1;prio-1
* Field.isRequired() should be a real validation -- TODO;milestone:v0.1;prio-1
* Field.isEditable() should have functionality -- TODO;milestone:v0.1;prio-1
* Field.isPersistent() should have functionality -- TODO;milestone:v0.1;prio-1
* Make tables + fields configurable and auto-creatable -- TODO;milestone:v0.1;prio-1 -- at what point shall we put non-persistent fields (sum fields etc) into the entity?
* Complete DefaultController: is currently missing aggregate fields... -- TODO;milestone:v0.1;prio-1
* Re-Add sorting and filtering -- TODO;milestone:v0.1;prio-1
* Re-activate server part -- TODO;milestone:v0.1;prio-1
* Re-Implement test app -- TODO;milestone:v0.1;prio-1 (Customer and invoice)
* Make tables + fields configurable and auto-creatable -- TODO;milestone:v0.1;prio-1 ... at what point shall we put non-persistent fields (sum fields etc) into the entity?
* error response generation in DefaultController is rather fragile, messages: [] should be in a function -- TODO;prio-2
* EntitySetModel.findAllEntities ... PHEW, this is actually a misnomer, as is the whole EntitySetModel, it is actually an EntityModelSet, and it returns EntityModels -- TODO;prio-2
* currently, the only place we call validate() is from save(); do we need to do that elsewhere? -- TODO;REFLECT;prio-2
* Entity should emit events before and after save(), update(), insert() -- TODO;REFLECT;prio-2
* Implement row locking -- TODO;prio-2
* server.js is an unnecessary singleton now, make it create an object -- TODO;prio-2
* use winston for logging -- TODO;prio-2
* add test for entity.toJson() - specifically, zoomfields -- TODO;prio-2
* Implement table locking? -- TODO;prio-2;REFLECT
* Implement transactions -- TODO;prio-2
* sql/sqlite/Query: restructure internally, and rename run() to runQuery() -- TODO;server;sql;prio-2
* auto-create id field again -- TODO;prio-2
* name of count field is now 'aggregate' which will be a bit unfortunate in the future, should get some unique name per query -- TODO;server;sql;prio-2
* use yuidoc or another tool for documentation -- TODO;documentation;prio-2
* use a good node library for dates and times TODO;datesandtimes;prio-2
* add more datatypes -- TODO;prio-2
* have a date AND a datetime type TODO;datesandtimes;prio-2
* handle datetimes correctly TODO;datesandtimes;prio-2
* always throw Errors, not just strings -- TODO;prio-2
* validate() might move from Field to ValueField -- TODO;REFLECT;prio-3
* Implement some kind of generalized CalcField -- TODO;REFLECT;prio-3 (currently not exactly needed)
* response.state and message are now strings, should become enums -- TODO;prio-3
* parse-out "DEVELOPMENT {" checks -- TODO;prio-3
* use node-assert for "DEVELOPMENT {" checks -- TODO;prio-3
* SumField, MinField, MaxField could be reduced to one AggregationField + 3 subclasses -- TODO;refactor;prio-3
* sql_DB: url is currently actually just a filename, and sqlite is hardcoded... TODO;prio-3
* move sql\_Field and its descendants, and sql\_Table, into a new namespace table -- TODO;refactor;prio-3 (currently, we always call \_getXxxxQueryString() AND \_getXxxxQueryParams() -- might warrant a (local?) class)
* getFields() vs getAttributes() should really be unified, we need to settle on either naming convention....! -- REFLECT;TODO;prio-3
* possibly extract sub-queries from sql/sqlite/Query -- REFLECT;server;prio-3
* REFLECT: do we need to extend LookupField to look into any field, or just the id (as it is now)? -- TODO
* REFLECT: possibly, LookupField should get the value-label from the master field too -- TODO
* REFLECT: do we want to be able to save() via a ZoomField, i.e. customer.setInvoices([inv1, inv2,...]); customer.save().then(...); ??? -- TODO;reflect;model
* use node7 Promises? -- REFLECT;server
* possibly be able to create an entity with default values from table/fields -- TODO;REFLECT;server
* bjooobject should prescribe a clone() method -- REJECTED
* sql\_Filter: 80:  return this.\_compareTo.value(); -- // OOOOPS this will not fly!!! it returns a promise now;REJECTED
* Entity.update() creates the wrong sql query: -- DONE;milestone:v0.1;prio-1;BUGFIX ( sqlite_db_runSql: queryString UPDATE customer SET id = ?, name = ? WHERE customer.id = customer.id parameters [ 1, 'beyt' ] -- runsql on UPDATE customer SET id = ?, name = ? WHERE customer.id = customer.id has promise { state: 'pending' })
* EntitySet needs to return an Entity, not an EntityModel -- DONE;milestone:v0.1;prio-1
* We need to clone the table upon entity creation, or find another way to create new tables for new entities -- DONE;entity
* return promises for getters; test it -- DONE;server
* spread all resulting fields over an object by request -- DONE
* SumField  -- DONE;sql;fields
* CountField  -- DONE;sql;fields
* LookupField -- DONE
* ZoomField - opposite of LookupField -- DONE
* the table given to EntitySetModel now has to already have an id field, because it is used to create the query() before the constructor gets called... should automatically add an id field! -- DONE
* Entity.getAllAttributes, .getAllAttributesAsList, .getAttributes, .getAtributesAsList -- DONE (call it get() with an optional array param -- DONE)
* table.getFieldLinks() seems pretty stupid -- DONE
* ditto: table.\_labelFields and lookupfields in general -- DONE
* ditto: table.\_fieldLinks -- DONE
* Implement MaxField --DONE;milestone:v0.1;prio-1
* Implement MinField --DONE;milestone:v0.1;prio-1
* REFLECT: should sql_Table.isDatabaseField and getDatabaseFields really have this name (possibly getWritableFields or similar?)? -- DONE;milestone:v0.1;prio-1
* Entity.update() creates the wrong sql query: -- DONE;milestone:v0.1;prio-1;BUGFIX (sqlite_db_runSql: queryString UPDATE customer SET id = ?, name = ? WHERE customer.id = customer.id parameters [ 1, 'beyt' ] -- runsql on UPDATE customer SET id = ?, name = ? WHERE customer.id = customer.id has promise { state: 'pending' })
* EntitySet needs to return an Entity, not an EntityModel -- DONE;milestone:v0.1;prio-1
* EntitySetModel.findAllEntities ... PHEW, this is actually a misnomer, as is the whole EntitySetModel, it is actually an EntityModelSet, and it returns EntityModels -- DONE;prio-2
* Re-Add sorting and filtering -- DONE;milestone:v0.1;prio-1
* re-enable validation for fields -- DONE;milestone:v0.1;prio-1
* re-enable validation for entities -- DONE;milestone:v0.1;prio-1 ----> currently only validates the model...
* field / entity / entityModel: canSave(), validate(), addValidation() -- REJECTED;milestone:v0.1;prio-1
* validation can not always create an error - we need canSave() and handle it correctly in the controller -- REJECTED;milestone:v0.1;prio-1
