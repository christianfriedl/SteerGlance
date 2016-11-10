* REFLECT: should sql_Table.isDatabaseField and getDatabaseFields really have this name (possibly getWritableFields or similar?)? -- TODO;prio-1
* Re-Add sorting and filtering -- TODO;prio-1
* Make tables + fields configurable and auto-creatable -- TODO;prio-1
    * at what point shall we put non-persistent fields (sum fields etc) into the entity?
* Re-activate server part -- TODO;prio-1
    * Plus write tests for it
* Re-Implement test app -- TODO;prio-1
    * Customer and invoice
* Implement locking -- TODO;prio-2
* Implement transactions -- TODO;prio-2
* sql/sqlite/Query: restructure internally, and rename run() to runQuery() -- TODO;server;sql;prio-2
* auto-create id field again -- TODO;prio-2
* name of count field is now 'aggregate' which will be a bit unfortunate in the future, should get some unique name per query -- TODO;server;sql;prio-2
* use yuidoc or another tool for documentation -- TODO;documentation;prio-2
* use a good node library for dates and times TODO;datesandtimes;prio-2
* have a date AND a datetime type TODO;datesandtimes;prio-2
* handle datetimes correctly TODO;datesandtimes;prio-2
* Implement some kind of generalized CalcField -- TODO;REFLECT;prio-3 (currently not exactly needed)
* parse-out "DEVELOPMENT {" checks -- TODO;prio-3
* use node-assert for "DEVELOPMENT {" checks -- TODO;prio-3
* SumField, MinField, MaxField could be reduced to one AggregationField + 3 subclasses -- TODO;refactor;prio-3
* move sql\_Field and its descendants, and sql\_Table, into a new namespace table -- TODO;refactor;prio-3
    * currently, we always call \_getXxxxQueryString() AND \_getXxxxQueryParams() -- might warrant a (local?) class
* We need to clone the table upon entity creation, or find another way to create new tables for new entities -- DONE;entity
* return promises for getters; test it -- DONE;server
* spread all resulting fields over an object by request -- DONE
* SumField  -- DONE;sql;fields
* CountField  -- DONE;sql;fields
* LookupField -- DONE
* ZoomField - opposite of LookupField -- DONE
* the table given to EntitySetModel now has to already have an id field, because it is used to create the query() before the constructor gets called... should automatically add an id field! -- DONE
* CalcField -- REFLECT;sql;fields
* REFLECT: do we need to extend LookupField to look into any field, or just the id (as it is now)? -- TODO
* REFLECT: possibly, LookupField should get the value-label from the master field too -- TODO
* REFLECT: do we want to be able to save() via a ZoomField, i.e. customer.setInvoices([inv1, inv2,...]); customer.save().then(...); ??? -- TODO;reflect;model
* use node7 Promises -- REFLECT;server
* possibly be able to create an entity with default values from table/fields -- TODO;REFLECT;server
* possibly extract sub-queries from sql/sqlite/Query -- REFLECT;server;prio-3
* Entity.getAllAttributes, .getAllAttributesAsList, .getAttributes, .getAtributesAsList -- DONE
    * call it get() with an optional array param -- DONE
* bjooobject should prescribe a clone() method -- REJECTED
* table.getFieldLinks() seems pretty stupid -- DONE
* ditto: table.\_labelFields and lookupfields in general -- DONE
* ditto: table.\_fieldLinks -- DONE
* sql\_Filter: 80:  return this.\_compareTo.value(); -- // OOOOPS this will not fly!!! it returns a promise now;REJECTED
* Implement MaxField --DONE;prio-1
* Implement MinField --DONE;prio-1
