* We need to clone the table upon entity creation, or find another way to create new tables for new entities -- DONE;entity
* return promises for getters; test it -- DONE;server
* spread all resulting fields over an object by request -- DONE
* Entity.getAllAttributes, .getAllAttributesAsList, .getAttributes, .getAtributesAsList -- TODO
    * call it get() with an optional array param -- TODO
* SumField  -- DONE;sql;fields
* CountField  -- DONE;sql;fields
* LookupField -- DONE
* CalcField -- REFLECT;sql;fields
* ZoomField - opposite of LookupField -- DONE
* REFLECT: do we need to extend LookupField to look into any field, or just the id (as it is now)? -- TODO
* REFLECT: possibly, LookupField should get the value-label from the master field too -- TODO
* bjooobject should prescribe a clone() method -- REJECTED
* table.getFieldLinks() seems pretty stupid -- TODO
* ditto: table.\_labelFields and lookupfields in general -- TODO
* ditto: table.\_fieldLinks -- TODO
* the table given to EntitySetModel now has to already have an id field, because it is used to create the query() before the constructor gets called... should automatically add an id field! -- DONE
* move sql\_Field and its descendants, and sql\_Table, into a new namespace table -- TODO;refactor
* REFLECT: do we want to be able to save() via a ZoomField, i.e. customer.setInvoices([inv1, inv2,...]); customer.save().then(...); ??? -- TODO;reflect;model
* sql\_Filter: 80:  return this.\_compareTo.value(); // TODO OOOOPS this will not fly!!! it returns a promise now
* handle datetimes correctly TODO;datesandtimes
* have a date AND a datetime type TODO;datesandtimes
* use a good node library for dates and times TODO;datesandtimes
* use yuidoc or another tool for documentation -- TODO;documentation
* use node7 Promises -- REFLECT;server
* possibly be able to create an entity with default values from table/fields -- TODO;REFLECT;server
* name of count field is now 'aggregate' which will be a bit unfortunate in the future, should get some unique name per query -- TODO;server;sql
* use node-assert for "DEVELOPMENT {" checks -- TODO;prio-3
* parse-out "DEVELOPMENT {" checks -- TODO;prio-3
* auto-create id field again -- TODO;prio-2
* possibly extract sub-queries from sql/sqlite/Query -- REFLECT;server;prio-3
    * currently, we always call \_getXxxxQueryString() AND \_getXxxxQueryParams() -- might warrant a (local?) class
* sql/sqlite/Query: restructure internally, and rename run() to runQuery() -- TODO;server;sql;prio-2
