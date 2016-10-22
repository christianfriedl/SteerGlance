<map version="freeplane 1.3.0">
<!--To view this file, download free mind mapping software Freeplane from http://freeplane.sourceforge.net -->
<node TEXT="BJO in Node.js" ID="ID_1723255651"><hook NAME="MapStyle" zoom="0.75">

<map_styles>
<stylenode LOCALIZED_TEXT="styles.root_node">
<stylenode LOCALIZED_TEXT="styles.predefined" POSITION="right">
<stylenode LOCALIZED_TEXT="default" MAX_WIDTH="600" COLOR="#000000" STYLE="as_parent">
<font NAME="SansSerif" SIZE="10" BOLD="false" ITALIC="false"/>
</stylenode>
<stylenode LOCALIZED_TEXT="defaultstyle.details"/>
<stylenode LOCALIZED_TEXT="defaultstyle.note"/>
<stylenode LOCALIZED_TEXT="defaultstyle.floating">
<edge STYLE="hide_edge"/>
<cloud COLOR="#f0f0f0" SHAPE="ROUND_RECT"/>
</stylenode>
</stylenode>
<stylenode LOCALIZED_TEXT="styles.user-defined" POSITION="right">
<stylenode LOCALIZED_TEXT="styles.topic" COLOR="#18898b" STYLE="fork">
<font NAME="Liberation Sans" SIZE="10" BOLD="true"/>
</stylenode>
<stylenode LOCALIZED_TEXT="styles.subtopic" COLOR="#cc3300" STYLE="fork">
<font NAME="Liberation Sans" SIZE="10" BOLD="true"/>
</stylenode>
<stylenode LOCALIZED_TEXT="styles.subsubtopic" COLOR="#669900">
<font NAME="Liberation Sans" SIZE="10" BOLD="true"/>
</stylenode>
<stylenode LOCALIZED_TEXT="styles.important">
<icon BUILTIN="yes"/>
</stylenode>
</stylenode>
<stylenode LOCALIZED_TEXT="styles.AutomaticLayout" POSITION="right">
<stylenode LOCALIZED_TEXT="AutomaticLayout.level.root" COLOR="#000000">
<font SIZE="18"/>
</stylenode>
<stylenode LOCALIZED_TEXT="AutomaticLayout.level,1" COLOR="#0033ff">
<font SIZE="16"/>
</stylenode>
<stylenode LOCALIZED_TEXT="AutomaticLayout.level,2" COLOR="#00b439">
<font SIZE="14"/>
</stylenode>
<stylenode LOCALIZED_TEXT="AutomaticLayout.level,3" COLOR="#990000">
<font SIZE="12"/>
</stylenode>
<stylenode LOCALIZED_TEXT="AutomaticLayout.level,4" COLOR="#111111">
<font SIZE="10"/>
</stylenode>
</stylenode>
</stylenode>
</map_styles>
</hook>
<hook NAME="AutomaticEdgeColor" COUNTER="9"/>
<node TEXT="&quot;BJO v.2&quot;" POSITION="right" ID="ID_28794418">
<edge COLOR="#ff00ff"/>
</node>
<node TEXT="Client" POSITION="right" ID="ID_71224373">
<edge COLOR="#ff0000"/>
<node TEXT="Node?" ID="ID_1913239834"/>
</node>
<node TEXT="Server" POSITION="right" ID="ID_1263539102">
<edge COLOR="#0000ff"/>
<node TEXT="Node?" ID="ID_282683585"/>
<node TEXT="transactional" ID="ID_285528198"/>
<node TEXT="all in sql?" ID="ID_51335204"/>
<node TEXT="how to model references" ID="ID_1518640490"/>
<node TEXT="sqlite backend?" ID="ID_748504985"/>
</node>
<node TEXT="Transport" POSITION="right" ID="ID_1864574725">
<edge COLOR="#00ff00"/>
<node TEXT="Json" ID="ID_19095344"/>
<node TEXT="list response" ID="ID_617404892">
<node TEXT="response { data: &#xa;   { action:  &apos;list&apos;,&#xa;     rows: &#xa;      [ { fields: &#xa;           [ { className:  &lt;&gt;,&#xa;               name:  &apos;...&apos;,&#xa;               dataType:  &lt;&gt;,&#xa;               value:  &lt;&gt;,&#xa;               label:  &lt;&gt;,&#xa;               seq: &lt;&gt;,&#xa;               isEditable:  &lt;&gt;,&#xa;               isRequired:  &lt;&gt;,&#xa;               links:  [] } ],&#xa;          id:  &lt;&gt; } ],&#xa;     aggregateRow: &#xa;      [  ],&#xa;     count:  20, // general count, not heeding limit&#xa;     templateRow: &#xa;      { fields: &#xa;         [] } } }" ID="ID_1860102900"/>
</node>
</node>
<node TEXT="Knowledge Base" POSITION="right" ID="ID_601035691">
<edge COLOR="#00007c"/>
<node TEXT="Where do we construct a field?" ID="ID_1928837733"/>
<node TEXT="Lookup" ID="ID_1701295977">
<node TEXT="Frontend Settings" ID="ID_156495861">
<node TEXT="Table has frontendSettings" ID="ID_258887503">
<node TEXT="default for module, controller, action in lookup" ID="ID_1571360157"/>
<node TEXT="default for labelField" ID="ID_208378221"/>
</node>
</node>
<node TEXT="lookupField has a fieldLink" ID="ID_1506697839">
<node TEXT="links to a field" ID="ID_1820494825"/>
</node>
</node>
<node TEXT="SumField, LookupField, Lazy Fields..." ID="ID_909088666">
<node TEXT="SumField" ID="ID_1049992680">
<node TEXT="has a fieldLink" ID="ID_1542350452"/>
</node>
<node TEXT="LookupField" ID="ID_1713406169">
<node TEXT="has a fieldLink" ID="ID_1246376414"/>
<node TEXT="cons can optionally be called with 5 params, and will then construct its own link via link()" ID="ID_1292093337"/>
</node>
</node>
<node TEXT="Table, Field, ValueField, Entity...." ID="ID_174335512">
<node TEXT="table.getFields() -&gt; object" ID="ID_1543629485">
<node TEXT="via EntityUtil?" ID="ID_1960591336"/>
<node TEXT="via Entity.fromTable()" ID="ID_837540452"/>
</node>
<node TEXT="object -&gt; Entity" ID="ID_715086752"/>
<node TEXT="Entity -&gt; EntityModel" ID="ID_739431472"/>
<node TEXT="so..." ID="ID_1537113514">
<node TEXT="table... -&gt; Entity.fromTable(table) -&gt; EntityModel.create(entity)" ID="ID_1671971364"/>
</node>
</node>
</node>
<node TEXT="TODO (not yet in bugzilla)" POSITION="right" ID="ID_1499193472">
<edge COLOR="#007c00"/>
<node TEXT="bjooobject should prescribe a clone() method" ID="ID_1404477386">
<node TEXT="cannot yet be done because it would seriously block development" ID="ID_1651944848"/>
</node>
<node TEXT="table.getFieldLinks() seems pretty stupid" ID="ID_1809777578"/>
<node TEXT="ditto: table._labelFields and lookupfields in general" ID="ID_1601476057"/>
<node TEXT="ditto: table._fieldLinks" ID="ID_1403477495"/>
</node>
<node TEXT="Scrum" POSITION="right" ID="ID_1919369938">
<edge COLOR="#7c0000"/>
<node TEXT="Todo" ID="ID_423863443">
<node TEXT="is in bugzilla" ID="ID_431300306">
<node TEXT="Prio 1" ID="ID_1488675716">
<node TEXT="sql: distinguish between frontendField and field?" ID="ID_1707574978">
<node TEXT="rather NO, does that little bit of additional info really hurt?" ID="ID_447815348"/>
</node>
<node TEXT="frontend: update count / sum after filtering" ID="ID_1002164671"/>
<node TEXT="frontend: update count after insert" ID="ID_160128588"/>
<node TEXT="frontend: implement delete" ID="ID_804335928"/>
<node TEXT="dao: calculatecalcfields(conditions...) and countbyconditions should probably move into daoset?" ID="ID_1935644299">
<icon BUILTIN="button_ok"/>
</node>
<node TEXT="fieldLinks: need clarification" ID="ID_220136488">
<node TEXT="under what circumstance can there ever be more than one?" ID="ID_542744221"/>
<node TEXT="currently, we&apos;re just using the first" ID="ID_669468957"/>
<node TEXT="lookupField/calcField ::link() might compose the link on call" ID="ID_629041098"/>
</node>
<node TEXT="backend: when setting the customer id from the frontend, fairly certainly we now do not set the customer() object" ID="ID_1137170107"/>
<node TEXT="dao: dao.calculateCalcfields() - remove conditions from params, if we are a primary dao... otherwise...???" ID="ID_1556723586"/>
<node TEXT="frontend: add drilldowns to listform" ID="ID_149198968"/>
<node TEXT="conditions for which fields to use are sometimes wrong" ID="ID_106910296">
<node TEXT="DaoDataProvider.prototype.writableFieldsAsList = function() {&#xa;    return _(this._fields).values().filter(function(f) {&#xa;        return !(f instanceof m_sql_calcField.CalcField)&#xa;            &amp;&amp; !(f instanceof m_sql_boField.BoField) }); // TODO this condition is not exactly right&#xa;        return !f.isEditable(); // TODO this SHOULD be the correct condition, but it does not work&#xa;};" ID="ID_1988996891"/>
</node>
<node TEXT="daoset: should dao.populateLookupFields move from loadByConditions to loadByQuery?" ID="ID_3304635"/>
<node TEXT="dao: calculatecalcfields(conditions...) and countbyconditions should probably move into daoset?" ID="ID_331627961"/>
<node TEXT="remove stupid and useless clone()" ID="ID_666612328">
<node TEXT="or rather, clarify where exactly to use fieldsFromDao" ID="ID_588673258"/>
</node>
<node TEXT="clarify / document client/server interface" ID="ID_1707431123">
<node TEXT="use json-schema" ID="ID_1693580485"/>
</node>
</node>
<node TEXT="Prio 2" ID="ID_64316623">
<node TEXT="reflect on cleaner interface between layers" ID="ID_1983523684">
<node TEXT="bo/dao" ID="ID_1891991254"/>
<node TEXT="dao/sql" ID="ID_134085748"/>
<node TEXT="split sql?" ID="ID_1742725425"/>
</node>
<node TEXT="frontend really does not have to fetch anything from backend before instantiating a form" ID="ID_1971642777">
<node TEXT="have a clean interface call for determining which form to use" ID="ID_1182499475"/>
<node TEXT="have a system for routing frontend forms" ID="ID_1633725770">
<node TEXT="especially, user-defined forms" ID="ID_1477318880"/>
</node>
</node>
<node TEXT="list response: aggregateRow is just an array, should be a row &quot;object&quot; with fields: []" ID="ID_947876021"/>
<node TEXT="reflect whether we should separate frontend-fields from sql/fields" ID="ID_1013306220"/>
<node TEXT="frontend: if pixel height gets really really large, then we run into issues with browser" ID="ID_1658048524"/>
<node TEXT="sql.query.conditions can currently only do AND" ID="ID_1842917786"/>
<node TEXT="the way we curretnly avoid circular dependencies in table construction (with stuff in addLinks()) is clearly suboptimal" ID="ID_569725763"/>
<node TEXT="bo._fieldValuesFromDao should use its own list, not the dao&apos;s" ID="ID_125867094"/>
<node TEXT="populateLookupFields() should pass a db to a function populate(db) in LookupField" ID="ID_1203408311"/>
<node TEXT="unify module var names to m_..." ID="ID_1238267829"/>
<node TEXT="add locking" ID="ID_547401360"/>
<node TEXT="add transactions" ID="ID_735663752"/>
<node TEXT="make forms backbutton- and bookmark-save" ID="ID_1211678358"/>
<node TEXT="add more data types" ID="ID_1894023975"/>
<node TEXT="bos: create convenience method for creating concrete bos (invoicebo...) without having to first create a dao" ID="ID_523156851"/>
<node TEXT="frontend: openlookup might be suboptimal; should use real java object instead of stringified object" ID="ID_728537161">
<node TEXT="needs naming convention for the variable" ID="ID_1918564664"/>
</node>
<node TEXT="lookupfield: .clone might be suboptimal, what if user changes Field stuff between construction and cloning?" ID="ID_1528169891"/>
<node TEXT="test-app" ID="ID_799636667">
<node TEXT="customer/ invoices" ID="ID_1907447430"/>
<node TEXT="costs" ID="ID_376143007"/>
</node>
<node TEXT="frontend: design filters" ID="ID_876598995"/>
<node TEXT="test-app: add invoices" ID="ID_1770355614"/>
<node TEXT="test-app: add costs" ID="ID_1058617269"/>
<node TEXT="add method for sequences to dao(set?)" ID="ID_1234828434"/>
<node TEXT="add visible/editable to fields" ID="ID_1168237780"/>
<node TEXT="null values when coming from form" ID="ID_958543010">
<node TEXT="should be config&apos;able per field" ID="ID_1729806340"/>
</node>
<node TEXT="queries: add additional aggregate/join queries" ID="ID_1593921330"/>
<node TEXT="fetch much more asynchronously from the frontend!" ID="ID_1921496055"/>
<node TEXT="calcField now works by returning a query.... maybe we want more consistency with boField which will work via value()" ID="ID_1324496424"/>
<node TEXT="Plan for fetching from FE / scrolling etc" ID="ID_1463795363">
<node TEXT="Fetch only count" ID="ID_1444155018"/>
<node TEXT="guesstimate height of content-div" ID="ID_1853977788"/>
<node TEXT="find out where we are scrolled to" ID="ID_818340448"/>
<node TEXT="fetch rows accordingly" ID="ID_1338402615"/>
<node TEXT="for each row" ID="ID_1082341436">
<node TEXT="fill calced fields" ID="ID_1844039011"/>
</node>
<node TEXT="fetch sums" ID="ID_1004679482"/>
<node TEXT="do all of that asynchronously!" ID="ID_1213865369">
<font BOLD="true"/>
</node>
</node>
<node TEXT="deal with circular deps...?" ID="ID_1175574652">
<node TEXT="fieldLink" ID="ID_1083936208"/>
<node TEXT="resolve by using events" ID="ID_147953381"/>
</node>
<node TEXT="possible issue: lookupfield._options have string values because they are an object!!!" ID="ID_481762657"/>
<node TEXT="specialize lazyFieldLink: currently a little abused in calcFields, which don&apos;t actually use a fieldLink, (oneToMany?!), but something a little different..." ID="ID_882852207"/>
<node TEXT="We now create field links per dao, but we should really only create them once per application" ID="ID_384555377">
<node TEXT="sadly, this involves changing the signatures of daos and bos" ID="ID_518037629"/>
</node>
</node>
<node TEXT="Prio 3" ID="ID_265969861">
<node TEXT="Reflect on using q/Promises instead of async" ID="ID_137781395"/>
<node TEXT="There is no explicit test for bo.calculateCalcFields and dao.calculateCalcFields in our test suites" ID="ID_1702884024"/>
<node TEXT="Be able to insert non-primary daos/bos" ID="ID_515705090"/>
<node TEXT="probably unroll the constructor/addLinks discrepancy in (e.g.) invoiceTable" ID="ID_640572594"/>
<node TEXT="possibly use id() instead of name() to identify fields internally" ID="ID_1908235904"/>
<node TEXT="frontend: optimize list scrolling" ID="ID_331420556">
<node TEXT="the actual putting it on the display is slow" ID="ID_1591595761"/>
</node>
<node TEXT="field-derived clone() functions might use field::clone()" ID="ID_1471968401">
<node TEXT="" ID="ID_362738841"/>
</node>
<node TEXT="split codebase" ID="ID_804344542">
<node TEXT="NodeSqlCore" ID="ID_1240592179"/>
<node TEXT="NodeSqlORM" ID="ID_764954713"/>
<node TEXT="NodeSqlWeb" ID="ID_1151111862"/>
<node TEXT="NodeSqlClient" ID="ID_361673061"/>
</node>
<node TEXT="rename LazyFieldLinkManager to LazyLinkManager" ID="ID_798753087"/>
<node TEXT="The LazyLinks should probably derive from a common baseclass to simulate an interface" ID="ID_246307817"/>
</node>
<node TEXT="Prio 3" ID="ID_1852199333">
<node TEXT="optimization: cache lookupfield options" ID="ID_32683467"/>
<node TEXT="secuirity: acheck against sql injection" ID="ID_1469007336"/>
<node TEXT="create some preprocessor for #ifdef" ID="ID_179422742"/>
<node TEXT="secuirity: acheck against xss" ID="ID_1037211750"/>
<node TEXT="server: fix error response" ID="ID_453376038"/>
<node TEXT="probably use _.isString() instead of util.isString()" ID="ID_274455070"/>
</node>
</node>
<node TEXT="TESTS to create" ID="ID_799999024">
<node TEXT="all functions should have type-checks with /* @DEVELOPMENT */" ID="ID_462989029"/>
</node>
</node>
<node TEXT="Done" ID="ID_314368932">
<node TEXT="resolve ambivalence" ID="ID_252337074">
<node TEXT="bo as object or as object-fetcher" ID="ID_866162368">
<node TEXT="boset" ID="ID_1879215516"/>
<node TEXT="bo" ID="ID_904312964"/>
</node>
<node TEXT="dao as object or as object-fetchr" ID="ID_1363264783">
<node TEXT="recordset" ID="ID_1424037263"/>
<node TEXT="record" ID="ID_1187107971">
<node TEXT="field getters/setters" ID="ID_248607712"/>
<node TEXT="loadById (if any)" ID="ID_612952630"/>
</node>
</node>
</node>
<node TEXT="frontend: add filters to listform" ID="ID_1625286015"/>
<node TEXT="frontend: addd conditions to listform" ID="ID_1795841236"/>
<node TEXT="frontend: after selecting for lookup field, saveField must be called" ID="ID_1419094424"/>
<node TEXT="frontend: ListForm now uses data.rows[0] for the header section" ID="ID_1419571184"/>
<node TEXT="frontend: test whether changing of lookup field actually works to do saveField" ID="ID_956917651"/>
<node TEXT="bo: use real objects for references" ID="ID_37481252">
<node TEXT="e.g. customerBo in invoice for customerId" ID="ID_1247201555"/>
<node TEXT="in reading from db" ID="ID_1962396267">
<node TEXT="at some point, we need to add the bo for its id field" ID="ID_796949035"/>
</node>
<node TEXT="in writing to db" ID="ID_5620214">
<node TEXT="at some point, we need to set the id from the bo" ID="ID_1634435108"/>
<node TEXT="primaryBo.prototype.save() seems like the best place for this" ID="ID_1553157502"/>
</node>
</node>
<node TEXT="bo: create actual objects instead of id-links" ID="ID_1271498552">
<node TEXT="invoice.customer" ID="ID_181813701"/>
<node TEXT="where?" ID="ID_1718271647">
<node TEXT="x" ID="ID_1413752723">
<node TEXT="BoField knows about its id-field" ID="ID_1279616049">
<node TEXT="i.e., a fieldLink" ID="ID_1417406084">
<node TEXT="of type manyToOne" ID="ID_1840146475"/>
</node>
</node>
<node TEXT="Bo::_fieldsFromDao() constructs the BoField" ID="ID_1767893560"/>
<node TEXT="BoField::value(val) sets its id field as a side-effect" ID="ID_419442135"/>
<node TEXT="the boField is not in the writeFields(blah) list" ID="ID_320277805"/>
</node>
</node>
</node>
<node TEXT="boField" ID="ID_345461857">
<icon BUILTIN="button_ok"/>
</node>
<node TEXT="add and run testBo.testBoFieldSet" ID="ID_181580310">
<icon BUILTIN="button_ok"/>
</node>
<node TEXT="testing: enable programmatically running only one test" ID="ID_589403690">
<icon BUILTIN="button_ok"/>
</node>
<node TEXT="conditions: add filters, limits" ID="ID_922616479"/>
<node TEXT="oop: do we want a defined conditions object?" ID="ID_692837098">
<node TEXT="currently we don&apos;t have it" ID="ID_226726835"/>
</node>
<node TEXT="orderby should work via fields, not strings" ID="ID_1403086015"/>
<node TEXT="add ordering to daoset.loadallbyconditions" ID="ID_579797318"/>
<node TEXT="create test for m_sql_orderby.orderby" ID="ID_518838018"/>
<node TEXT="frontend: add scrolling to listform" ID="ID_1689836394"/>
<node TEXT="frontend: streamline initial request by using ajax" ID="ID_587838158"/>
<node TEXT="frontend: revisit edit form" ID="ID_1656955817"/>
<node TEXT="table: use instanceof for determining field classes" ID="ID_1320547546">
<node TEXT="still does not work!!!" ID="ID_1866960159"/>
<node TEXT="create small isA() framework" ID="ID_821408512"/>
</node>
<node TEXT="dao/bo..." ID="ID_131649401">
<node TEXT="populateLookupFields, calculateCalcFields (loadBoFields?) should be options in constructors" ID="ID_1591555340"/>
</node>
<node TEXT="bo&lt;-&gt;dao: clarify databaseFieldsAsList etc" ID="ID_1846015437"/>
<node TEXT="frontend: optimize scrolling" ID="ID_1890576359">
<node TEXT="calculate top" ID="ID_1590919464">
<node TEXT="row-height = first row height" ID="ID_1381244649"/>
<node TEXT="determine offset and limit" ID="ID_51970493"/>
<node TEXT="= row-number * row-height" ID="ID_1939587224"/>
</node>
</node>
<node TEXT="frontend: add keyboard navigation" ID="ID_1945980710"/>
<node TEXT="frontend: edit in list probably doesn&apos;t work now" ID="ID_1653320881"/>
<node TEXT="daoset/boset: populateLookupFields, calculateCalcfields should be options on the daoset/boset, not on the load... function" ID="ID_1766615146"/>
<node TEXT="rename webize() to toJson() and ...Webized() to ...ToJson()" ID="ID_372599290"/>
<node TEXT="backend: implement delete" ID="ID_1745908832"/>
</node>
</node>
<node TEXT="Diary" POSITION="right" ID="ID_1729009659">
<edge COLOR="#00ffff"/>
<node TEXT="2015" ID="ID_964006408">
<node TEXT="04" ID="ID_1187779950">
<node TEXT="27" ID="ID_1341591784">
<node TEXT="wieder mal reingekippt" ID="ID_1320836215"/>
</node>
<node TEXT="17" ID="ID_109029675">
<node TEXT="was soll passieren beim feld-&#xe4;ndern?" ID="ID_1896478868">
<node TEXT="update" ID="ID_1747475272"/>
<node TEXT="insert" ID="ID_1829084091"/>
<node TEXT="vom frontend aus" ID="ID_1029062556">
<node TEXT="saveField" ID="ID_1293311619">
<node TEXT="[ { name: ..., value: ... }, ..., currentField: name" ID="ID_1678217512"/>
</node>
</node>
<node TEXT="im backend" ID="ID_2190357">
<node TEXT="wenn id unleer" ID="ID_1858660533">
<node TEXT="loadById" ID="ID_1946214181"/>
</node>
<node TEXT="felder vom form dr&#xfc;bersetzen" ID="ID_915609873"/>
<node TEXT="feldValidatoren rufen" ID="ID_588650799">
<node TEXT="f&#xfc;r currentField" ID="ID_649571912"/>
</node>
<node TEXT="wenn gutgegangen" ID="ID_1316864335">
<node TEXT="wenn id unleer" ID="ID_1603947283">
<node TEXT="bo-validatoren rufen" ID="ID_437270923"/>
</node>
</node>
<node TEXT="wenn gutgegangen" ID="ID_606765180">
<node TEXT="speichern" ID="ID_755576089"/>
</node>
</node>
</node>
<node TEXT="autoSave + saveField" ID="ID_1449841197">
<node TEXT="sind alle required fields ausgef&#xfc;llt?" ID="ID_78787627"/>
<node TEXT="ich muss alle felder vom form holen" ID="ID_944256545">
<node TEXT="weil ich ja keinen halben datensatz speichern kann" ID="ID_1888516385"/>
</node>
<node TEXT="felder im form brauchen ein &quot;dirty&quot; flag" ID="ID_394469690">
<node TEXT="NEIN, sie sind entweder ausgef&#xfc;llt oder nicht" ID="ID_1855562146"/>
</node>
<node TEXT="&apos;&apos; = NULL???" ID="ID_1076353818">
<node TEXT="jetzt mal nein, ist ein TODO" ID="ID_1677446564"/>
</node>
</node>
</node>
<node TEXT="29" ID="ID_1031889558">
<node TEXT="backend kann schon so einiges; fe und client-kommunikation noch extrem rudiment&#xe4;r" ID="ID_232588525"/>
</node>
</node>
<node TEXT="09" ID="ID_667945839">
<node TEXT="ich schau mal wieder ins boFeld..." ID="ID_536837547"/>
<node TEXT="Handling im Frontend - Plan f&#xfc;r scrolling?" ID="ID_1409362391"/>
<node TEXT="Wir sollten noch viel feingranularer asynchron werden... auch count etc getrennt vom FE fetchen" ID="ID_1628562964"/>
</node>
</node>
<node TEXT="2016" ID="ID_1275888629">
<node TEXT="10" ID="ID_835016611">
<node TEXT="21" ID="ID_1452674495">
<node TEXT="Yay, another revamp" ID="ID_877807473">
<node TEXT="customer.save()" ID="ID_1028571099">
<node TEXT="YAY" ID="ID_369627934"/>
</node>
<node TEXT="SteerGlance.save(customer);" ID="ID_294885178"/>
<node TEXT="SteerGlance.Entity.create(customer).save()" ID="ID_921435715"/>
<node TEXT="SteerGlance.save(customer) -&gt; SteerGlance.Entity.create(customer).save()" ID="ID_1044482333"/>
<node TEXT="CustomerSet.loadById(1);" ID="ID_1451454720"/>
<node TEXT="SteerGlance.loadById(Customer, 1);" ID="ID_1702672354">
<node TEXT="YAY" ID="ID_396307954"/>
</node>
<node TEXT="or EntitySet.loadEntityById(Customer, 1);" ID="ID_887239172">
<node TEXT="--- can always do shortcut" ID="ID_670856316"/>
<node TEXT="CustomerSet.loadEntityById(1) { return EntitySet.load...(); }" ID="ID_1753725607"/>
</node>
</node>
</node>
<node TEXT="22" ID="ID_1965810062">
<node TEXT="Customer IS A Primary Entity" ID="ID_1751292982"/>
<node TEXT="Primary Entity IS AN Entity" ID="ID_1297975182"/>
<node TEXT="Entity HAS a model" ID="ID_193536894">
<node TEXT="EntityModel, which currently refers to a sql backend, but that is not necessarily the case" ID="ID_354412729"/>
</node>
<node TEXT="PrimaryEntity HAS a PrimaryEntityModel" ID="ID_642146609"/>
<node TEXT="EntityModel has method .save()" ID="ID_1039188459"/>
<node TEXT="PrimaryEntityModel has a method .save()" ID="ID_1070725145"/>
<node TEXT="PrimaryEntitySet has a method .loadById(/* function */ constructor)" ID="ID_592998240"/>
<node TEXT="Model has a method .setDb() and a data object" ID="ID_1145326904">
<node TEXT="... or some kind of table with fields and values" ID="ID_1537253105"/>
</node>
</node>
</node>
</node>
</node>
</node>
</map>
