type SparkFunctionDocumentationBase = {
  name: string;
  args?: string[];
  description: string;
  examples: {
    statement: string;
    result?: string;
  }[];
};

const SPARK_FUNCTION_TYPE = { SPARK: 'spark', CUSTOM: 'custom' } as const;

export type SparkFunctionType =
  (typeof SPARK_FUNCTION_TYPE)[keyof typeof SPARK_FUNCTION_TYPE];

export type SparkFunctionDocumentation = SparkFunctionDocumentationBase & {
  type: SparkFunctionType;
};

const customCogniteSparkFnDocumentations: SparkFunctionDocumentationBase[] = [
  {
    name: 'get_names',
    args: ['var_args'],
    description: 'Returns an array of the field names of a struct or row.',
    examples: [
      {
        statement: 'select get_names(*) from mydb.mytable',
      },
      {
        statement: 'select get_names(some_struct.*) from mydb.mytable',
      },
    ],
  },
  {
    name: 'cast_to_strings',
    args: ['var_args'],
    description:
      'Casts the arguments to an array of strings. It handles array, struct and map types by casting it to JSON strings.',
    examples: [
      {
        statement: 'select cast_to_strings(*) from mydb.mytable',
      },
    ],
  },
  {
    name: 'to_metadata',
    args: ['var_args'],
    description:
      'Creates metadata compatible type from the arguments. In practice it does <code>map_from_arrays(get_names(var_args), cast_to_strings(var_args))</code>. Use this function when you want to transform your columns or structures into a format that fits the metadata field in CDF.',
    examples: [
      {
        statement: 'select to_metadata(*) from mydb.mytable',
      },
    ],
  },
  {
    name: 'to_metadata_except',
    args: ['var_args'],
    description:
      'Returns a metadata structure <code>(Map[String, String])</code> where strings found in excludeFilter will exclude keys from var_args. Use this function when you want to put most, but not all, columns into metadata, for example <code>to_metadata_except(array("someColumnToExclude"), *)</code>',
    examples: [
      {
        statement:
          'select to_metadata_except(array("myCol"), myCol, testCol) from mydb.mytable',
      },
    ],
  },
  {
    name: 'asset_ids',
    args: ['var_args'],
    description:
      'Attempts to find asset names under the given criteria and return the IDs of the matching assets.',
    examples: [
      {
        statement: 'select asset_ids(array("PV10", "PV11"))',
      },
      {
        statement: 'select asset_ids(array("PV10", "PV11"), "MyBoat")',
      },
      {
        statement:
          'select asset_ids(array("PV10", "PV11"), array(254343, 23433, 54343))',
      },
      {
        statement:
          'select asset_ids(array("PV10", "PV11"), array(dataset_id("pv-254343-ext-id"), 23433, 54343))',
      },
      {
        statement:
          'select asset_ids(array("PV10", "PV11"), "MyBoat", array(dataset_id("pv-254343-ext-id"), 23433, 54343))',
      },
    ],
  },
  {
    name: 'is_new',
    args: ['name', 'version'],
    description:
      'Returns true if the version provided is higher than the version found with the specified name, based on the last time the transformation was run. If the transformation completes successfully, the next transformation job only processes rows that have changed since the start of the last successfully completed transformation job. If the transformation fails, is_new processes all rows that have changed since the start of the last successful run. This ensures no data loss in the transformation from source to destination.',
    examples: [
      {
        statement:
          'select * from mydb.mytable where is_new("mydb_mytable_version", lastUpdatedTime)',
      },
    ],
  },
  {
    name: 'dataset_id',
    args: ['externalId'],
    description:
      'Attempts to find the <code>id</code> of the given data set by <code>externalId</code> and returns the <code>id</code> if the <code>externalId</code> exists.',
    examples: [
      {
        statement: 'select dataset_id("EXAMPLE_DATASET") as dataSetId',
      },
    ],
  },
  {
    name: 'cdf_assetSubtree',
    args: ['externalId', 'id'],
    description:
      'Returns an asset subtree under a specific asset in an asset hierarchy, that is, all the child assets for a specific asset in an asset hierarchy are returned.',
    examples: [
      {
        statement: 'select * from cdf_assetSubtree("externalId of an asset")',
      },
      {
        statement: 'select * from cdf_assetSubtree("id of an asset")',
      },
    ],
  },
  {
    name: 'cdf_nodes',
    args: ['viewSpace', 'viewExternalId', 'viewVersion'],
    description: 'Returns nodes in the CDF project as a table.',
    examples: [
      {
        statement:
          'select * from cdf_nodes("space of the view: String", "externalId of the view: String", "version of the view: String")',
      },
      {
        statement: 'select * from cdf_nodes()',
      },
    ],
  },
  {
    name: 'cdf_edges',
    args: ['viewSpace', 'viewExternalId', 'viewVersion'],
    description: 'Returns edges in the CDF project as a table.',
    examples: [
      {
        statement:
          'select * from cdf_edges("space of the view: String", "externalId of the view: String", "version of the view: String")',
      },
      {
        statement: 'select * from cdf_edges()',
      },
    ],
  },
  {
    name: 'node_reference',
    args: ['space', 'externalId'],
    description:
      '<code>node_reference</code> accepts the single parameter <code>externalId</code> of the node. The target/instance space set at the transformation is used as the space <code>externalId</code> of the node.',
    examples: [
      {
        statement:
          'select node_reference("space externalId of a node", "externalId of a node") as startNode, node_reference("space externalId of a node", "externalId of a node") as endNode, ... from mydb.mytable',
      },
      {
        statement:
          'select node_reference("externalId of a node") as startNode, node_reference("externalId of a node") as endNode, ... from mydb.mytable',
      },
      {
        statement:
          'select * from cdf_edges("space of the view: String", "externalId of the view: String", "version of the view: String") where startNode = node_reference("space externalId of a node", "externalId of a node") or node_reference("space externalId of a node", "externalId of a node")',
      },
    ],
  },
  {
    name: 'type_reference',
    args: ['space', 'externalId'],
    description:
      '<code>type_reference</code> accepts the single parameter <code>externalId</code> of the edge type. The target/instance space set at the transformation is used as the space <code>externalId</code> of the edge type.',
    examples: [
      {
        statement:
          'select node_reference("space externalId of a node", "externalId of a node") as startNode, type_reference("space externalId of a node", "externalId of a node") as endNode, ... from mydb.mytable',
      },
      {
        statement:
          'select * from cdf_edges("space of the view: String", "externalId of the view: String", "version of the view: String") where type = type_reference("space externalId of a node", "externalId of a node") or type_reference("space externalId of a node", "externalId of a node")',
      },
      {
        statement:
          'select * from cdf_edges() where type = type_reference("space externalId of a node", "externalId of a node") or type_reference("space externalId of a node", "externalId of a node")',
      },
    ],
  },
  {
    name: 'cdf_data_models',
    args: ['modelSpace', 'modelExternalId', 'modelVersion', 'typeExternalId'],
    description:
      'These functions follow the data model UI lingo and make it easy to retrieve the data written to <code>types</code> and <code>relationship</code>.',
    examples: [
      {
        statement:
          'select * from cdf_data_models("data model space: String", "data model externalId: String", "data model version: String", "type external id: String")',
      },
      {
        statement:
          'select * from cdf_data_models("data model space: String", "data model externalId: String", "data model version: String", "type external id: String", "property in type where relationship is defined: String")',
      },
    ],
  },
];

const builtInSparkFnDocumentations: SparkFunctionDocumentationBase[] = [
  {
    args: ['expr'],
    description: 'Returns the absolute value of the numeric or interval value.',
    examples: [
      {
        statement: 'SELECT abs(-1);',
        result: '1',
      },
      {
        statement: "SELECT abs(INTERVAL -'1-1' YEAR TO MONTH);",
        result: '1-1',
      },
    ],
    name: 'abs',
  },
  {
    args: ['expr'],
    description:
      'Returns the inverse cosine (a.k.a. arc cosine) of expr, as if computed by\njava.lang.Math.acos.',
    examples: [
      {
        statement: 'SELECT acos(1);',
        result: '0.0',
      },
      {
        statement: 'SELECT acos(2);',
        result: 'NaN',
      },
    ],
    name: 'acos',
  },
  {
    args: ['expr'],
    description: 'Returns inverse hyperbolic cosine of expr.',
    examples: [
      {
        statement: 'SELECT acosh(1);',
        result: '0.0',
      },
      {
        statement: 'SELECT acosh(0);',
        result: 'NaN',
      },
    ],
    name: 'acosh',
  },
  {
    args: ['start_date', 'num_months'],
    description: 'Returns the date that is num_months after start_date.',
    examples: [
      {
        statement: "SELECT add_months('2016-08-31', 1);",
        result: '2016-09-30',
      },
    ],
    name: 'add_months',
  },
  {
    args: ['expr', 'key[', ' mode[', ' padding]]'],
    description:
      "Returns a decrypted value of expr using AES in mode with padding.\nKey lengths of 16, 24 and 32 bits are supported. Supported combinations of (mode, padding) are ('ECB', 'PKCS') and ('GCM', 'NONE').\nThe default mode is GCM.",
    examples: [
      {
        statement:
          "SELECT aes_decrypt(unhex('83F16B2AA704794132802D248E6BFD4E380078182D1544813898AC97E709B28A94'), '0000111122223333');",
        result: 'Spark',
      },
      {
        statement:
          "SELECT aes_decrypt(unhex('6E7CA17BBB468D3084B5744BCA729FB7B2B7BCB8E4472847D02670489D95FA97DBBA7D3210'), '0000111122223333', 'GCM');",
        result: 'Spark SQL',
      },
      {
        statement:
          "SELECT aes_decrypt(unbase64('3lmwu+Mw0H3fi5NDvcu9lg=='), '1234567890abcdef', 'ECB', 'PKCS');",
        result: 'Spark SQL',
      },
    ],
    name: 'aes_decrypt',
  },
  {
    args: ['expr', 'key[', ' mode[', ' padding]]'],
    description:
      "Returns an encrypted value of expr using AES in given mode with the specified padding.\nKey lengths of 16, 24 and 32 bits are supported. Supported combinations of (mode, padding) are ('ECB', 'PKCS') and ('GCM', 'NONE').\nThe default mode is GCM.",
    examples: [
      {
        statement: "SELECT hex(aes_encrypt('Spark', '0000111122223333'));",
        result:
          '83F16B2AA704794132802D248E6BFD4E380078182D1544813898AC97E709B28A94',
      },
      {
        statement:
          "SELECT hex(aes_encrypt('Spark SQL', '0000111122223333', 'GCM'));",
        result:
          '6E7CA17BBB468D3084B5744BCA729FB7B2B7BCB8E4472847D02670489D95FA97DBBA7D3210',
      },
      {
        statement:
          "SELECT base64(aes_encrypt('Spark SQL', '1234567890abcdef', 'ECB', 'PKCS'));",
        result: '3lmwu+Mw0H3fi5NDvcu9lg==',
      },
    ],
    name: 'aes_encrypt',
  },
  {
    args: ['expr', 'start', ' merge', ' finish'],
    description:
      'Applies a binary operator to an initial state and all\nelements in the array, and reduces this to a single state. The final state is converted\ninto the final result by applying a finish function.',
    examples: [
      {
        statement: 'SELECT aggregate(array(1, 2, 3), 0, (acc, x) -> acc + x);',
        result: '6',
      },
      {
        statement:
          'SELECT aggregate(array(1, 2, 3), 0, (acc, x) -> acc + x, acc -> acc * 10);',
        result: '60',
      },
    ],
    name: 'aggregate',
  },
  {
    args: ['expr'],
    description: 'Returns true if at least one value of expr is true.',
    examples: [
      {
        statement:
          'SELECT any(col) FROM VALUES (true), (false), (false) AS tab(col);',
        result: 'true',
      },
      {
        statement:
          'SELECT any(col) FROM VALUES (NULL), (true), (false) AS tab(col);',
        result: 'true',
      },
      {
        statement:
          'SELECT any(col) FROM VALUES (false), (false), (NULL) AS tab(col);',
        result: 'false',
      },
    ],
    name: 'any',
  },
  {
    args: ['expr[', 'relativeSD]'],
    description:
      'Returns the estimated cardinality by HyperLogLog++.\nrelativeSD defines the maximum relative standard deviation allowed.',
    examples: [
      {
        statement:
          'SELECT approx_count_distinct(col1) FROM VALUES (1), (1), (2), (2), (3) tab(col1);',
        result: '3',
      },
    ],
    name: 'approx_count_distinct',
  },
  {
    args: ['col', 'percentage [', ' accuracy]'],
    description:
      'Returns the approximate percentile of the numeric or\nansi interval column col which is the smallest value in the ordered col values (sorted\nfrom least to greatest) such that no more than percentage of col values is less than\nthe value or equal to that value. The value of percentage must be between 0.0 and 1.0.\nThe accuracy parameter (default: 10000) is a positive numeric literal which controls\napproximation accuracy at the cost of memory. Higher value of accuracy yields better\naccuracy, 1.0/accuracy is the relative error of the approximation.\nWhen percentage is an array, each value of the percentage array must be between 0.0 and 1.0.\nIn this case, returns the approximate percentile array of column col at the given\npercentage array.',
    examples: [
      {
        statement:
          'SELECT approx_percentile(col, array(0.5, 0.4, 0.1), 100) FROM VALUES (0), (1), (2), (10) AS tab(col);',
        result: '[1,1,0]',
      },
      {
        statement:
          'SELECT approx_percentile(col, 0.5, 100) FROM VALUES (0), (6), (7), (9), (10) AS tab(col);',
        result: '7',
      },
      {
        statement:
          "SELECT approx_percentile(col, 0.5, 100) FROM VALUES (INTERVAL '0' MONTH), (INTERVAL '1' MONTH), (INTERVAL '2' MONTH), (INTERVAL '10' MONTH) AS tab(col);",
        result: '0-1',
      },
      {
        statement:
          "SELECT approx_percentile(col, array(0.5, 0.7), 100) FROM VALUES (INTERVAL '0' SECOND), (INTERVAL '1' SECOND), (INTERVAL '2' SECOND), (INTERVAL '10' SECOND) AS tab(col);",
        result: '[0 00:00:01.000000000,0 00:00:02.000000000]',
      },
    ],
    name: 'approx_percentile',
  },
  {
    args: ['expr', '...'],
    description: 'Returns an array with the given elements.',
    examples: [
      {
        statement: 'SELECT array(1, 2, 3);',
        result: '[1,2,3]',
      },
    ],
    name: 'array',
  },
  {
    args: ['expr'],
    description: 'Collects and returns a list of non',
    examples: [
      {
        statement:
          'SELECT array_agg(col) FROM VALUES (1), (2), (1) AS tab(col);',
        result: '[1,2,1]',
      },
    ],
    name: 'array_agg',
  },
  {
    args: ['array', 'value'],
    description: 'Returns true if the array contains the value.',
    examples: [
      {
        statement: 'SELECT array_contains(array(1, 2, 3), 2);',
        result: 'true',
      },
    ],
    name: 'array_contains',
  },
  {
    args: ['array'],
    description: 'Removes duplicate values from the array.',
    examples: [
      {
        statement: 'SELECT array_distinct(array(1, 2, 3, null, 3));',
        result: '[1,2,3,null]',
      },
    ],
    name: 'array_distinct',
  },
  {
    args: ['array1', 'array2'],
    description:
      'Returns an array of the elements in array1 but not in array2,\nwithout duplicates.',
    examples: [
      {
        statement: 'SELECT array_except(array(1, 2, 3), array(1, 3, 5));',
        result: '[2]',
      },
    ],
    name: 'array_except',
  },
  {
    args: ['array1', 'array2'],
    description:
      'Returns an array of the elements in the intersection of array1 and\narray2, without duplicates.',
    examples: [
      {
        statement: 'SELECT array_intersect(array(1, 2, 3), array(1, 3, 5));',
        result: '[1,3]',
      },
    ],
    name: 'array_intersect',
  },
  {
    args: ['array', 'delimiter[', ' nullReplacement]'],
    description:
      'Concatenates the elements of the given array\nusing the delimiter and an optional string to replace nulls. If no value is set for\nnullReplacement, any null value is filtered.',
    examples: [
      {
        statement: "SELECT array_join(array('hello', 'world'), ' ');",
        result: 'hello world',
      },
      {
        statement: "SELECT array_join(array('hello', null ,'world'), ' ');",
        result: 'hello world',
      },
      {
        statement:
          "SELECT array_join(array('hello', null ,'world'), ' ', ',');",
        result: 'hello , world',
      },
    ],
    name: 'array_join',
  },
  {
    args: ['array'],
    description:
      'Returns the maximum value in the array. NaN is greater than\nany non',
    examples: [
      {
        statement: 'SELECT array_max(array(1, 20, null, 3));',
        result: '20',
      },
    ],
    name: 'array_max',
  },
  {
    args: ['array'],
    description:
      'Returns the minimum value in the array. NaN is greater than\nany non',
    examples: [
      {
        statement: 'SELECT array_min(array(1, 20, null, 3));',
        result: '1',
      },
    ],
    name: 'array_min',
  },
  {
    args: ['array', 'element'],
    description: 'Returns the (1',
    examples: [
      {
        statement: 'SELECT array_position(array(3, 2, 1), 1);',
        result: '3',
      },
    ],
    name: 'array_position',
  },
  {
    args: ['array', 'element'],
    description: 'Remove all elements that equal to element from array.',
    examples: [
      {
        statement: 'SELECT array_remove(array(1, 2, 3, null, 3), 3);',
        result: '[1,2,null]',
      },
    ],
    name: 'array_remove',
  },
  {
    args: ['element', 'count'],
    description: 'Returns the array containing element count times.',
    examples: [
      {
        statement: "SELECT array_repeat('123', 2);",
        result: '["123","123"]',
      },
    ],
    name: 'array_repeat',
  },
  {
    args: ['expr'],
    description:
      'Returns the size of an array. The function returns null for null input.',
    examples: [
      {
        statement: "SELECT array_size(array('b', 'd', 'c', 'a'));",
        result: '4',
      },
    ],
    name: 'array_size',
  },
  {
    args: ['expr', 'func'],
    description:
      'Sorts the input array. If func is omitted, sort\nin ascending order. The elements of the input array must be orderable.\nNaN is greater than any non',
    examples: [
      {
        statement:
          'SELECT array_sort(array(5, 6, 1), (left, right) -> case when left < right then -1 when left > right then 1 else 0 end);',
        result: '[1,5,6]',
      },
      {
        statement:
          "SELECT array_sort(array('bc', 'ab', 'dc'), (left, right) -> case when left is null and right is null then 0 when left is null then -1 when right is null then 1 when left < right then 1 when left > right then -1 else 0 end);",
        result: '["dc","bc","ab"]',
      },
      {
        statement: "SELECT array_sort(array('b', 'd', null, 'c', 'a'));",
        result: '["a","b","c","d",null]',
      },
    ],
    name: 'array_sort',
  },
  {
    args: ['array1', 'array2'],
    description:
      'Returns an array of the elements in the union of array1 and array2,\nwithout duplicates.',
    examples: [
      {
        statement: 'SELECT array_union(array(1, 2, 3), array(1, 3, 5));',
        result: '[1,2,3,5]',
      },
    ],
    name: 'array_union',
  },
  {
    args: ['a1', 'a2'],
    description: 'Returns true if a1 contains at least a non',
    examples: [
      {
        statement: 'SELECT arrays_overlap(array(1, 2, 3), array(3, 4, 5));',
        result: 'true',
      },
    ],
    name: 'arrays_overlap',
  },
  {
    args: ['a1', 'a2', ' ...'],
    description: 'Returns a merged array of structs in which the N',
    examples: [
      {
        statement: 'SELECT arrays_zip(array(1, 2, 3), array(2, 3, 4));',
        result: '[{"0":1,"1":2},{"0":2,"1":3},{"0":3,"1":4}]',
      },
      {
        statement: 'SELECT arrays_zip(array(1, 2), array(2, 3), array(3, 4));',
        result: '[{"0":1,"1":2,"2":3},{"0":2,"1":3,"2":4}]',
      },
    ],
    name: 'arrays_zip',
  },
  {
    args: ['str'],
    description: 'Returns the numeric value of the first character of str.',
    examples: [
      {
        statement: "SELECT ascii('222');",
        result: '50',
      },
      {
        statement: 'SELECT ascii(2);',
        result: '50',
      },
    ],
    name: 'ascii',
  },
  {
    args: ['expr'],
    description:
      'Returns the inverse sine (a.k.a. arc sine) the arc sin of expr,\nas if computed by java.lang.Math.asin.',
    examples: [
      {
        statement: 'SELECT asin(0);',
        result: '0.0',
      },
      {
        statement: 'SELECT asin(2);',
        result: 'NaN',
      },
    ],
    name: 'asin',
  },
  {
    args: ['expr'],
    description: 'Returns inverse hyperbolic sine of expr.',
    examples: [
      {
        statement: 'SELECT asinh(0);',
        result: '0.0',
      },
    ],
    name: 'asinh',
  },
  {
    args: ['expr'],
    description: 'Throws an exception if expr is not true.',
    examples: [
      {
        statement: 'SELECT assert_true(0 < 1);',
        result: 'NULL',
      },
    ],
    name: 'assert_true',
  },
  {
    args: ['expr'],
    description:
      'Returns the inverse tangent (a.k.a. arc tangent) of expr, as if computed by\njava.lang.Math.atan',
    examples: [
      {
        statement: 'SELECT atan(0);',
        result: '0.0',
      },
    ],
    name: 'atan',
  },
  {
    args: ['exprY', 'exprX'],
    description: 'Returns the angle in radians between the positive x',
    examples: [
      {
        statement: 'SELECT atan2(0, 0);',
        result: '0.0',
      },
    ],
    name: 'atan2',
  },
  {
    args: ['expr'],
    description: 'Returns inverse hyperbolic tangent of expr.',
    examples: [
      {
        statement: 'SELECT atanh(0);',
        result: '0.0',
      },
      {
        statement: 'SELECT atanh(2);',
        result: 'NaN',
      },
    ],
    name: 'atanh',
  },
  {
    args: ['expr'],
    description: 'Returns the mean calculated from values of a group.',
    examples: [
      {
        statement: 'SELECT avg(col) FROM VALUES (1), (2), (3) AS tab(col);',
        result: '2.0',
      },
      {
        statement: 'SELECT avg(col) FROM VALUES (1), (2), (NULL) AS tab(col);',
        result: '1.5',
      },
    ],
    name: 'avg',
  },
  {
    args: ['bin'],
    description: 'Converts the argument from a binary bin to a base 64 string.',
    examples: [
      {
        statement: "SELECT base64('Spark SQL');",
        result: 'U3BhcmsgU1FM',
      },
    ],
    name: 'base64',
  },
  {
    args: ['expr'],
    description:
      'Returns the string representation of the long value expr represented in binary.',
    examples: [
      {
        statement: 'SELECT bin(13);',
        result: '1101',
      },
      {
        statement: 'SELECT bin(-13);',
        result:
          '1111111111111111111111111111111111111111111111111111111111110011',
      },
      {
        statement: 'SELECT bin(13.3);',
        result: '1101',
      },
    ],
    name: 'bin',
  },
  {
    args: ['expr'],
    description: 'Returns the bitwise AND of all non',
    examples: [
      {
        statement: 'SELECT bit_and(col) FROM VALUES (3), (5) AS tab(col);',
        result: '1',
      },
    ],
    name: 'bit_and',
  },
  {
    args: ['expr'],
    description:
      'Returns the number of bits that are set in the argument expr as an unsigned 64',
    examples: [
      {
        statement: 'SELECT bit_count(0);',
        result: '0',
      },
    ],
    name: 'bit_count',
  },
  {
    args: ['expr', 'pos'],
    description:
      'Returns the value of the bit (0 or 1) at the specified position.\nThe positions are numbered from right to left, starting at zero.\nThe position argument cannot be negative.',
    examples: [
      {
        statement: 'SELECT bit_get(11, 0);',
        result: '1',
      },
      {
        statement: 'SELECT bit_get(11, 2);',
        result: '0',
      },
    ],
    name: 'bit_get',
  },
  {
    args: ['expr'],
    description:
      'Returns the bit length of string data or number of bits of binary data.',
    examples: [
      {
        statement: "SELECT bit_length('Spark SQL');",
        result: '72',
      },
    ],
    name: 'bit_length',
  },
  {
    args: ['expr'],
    description: 'Returns the bitwise OR of all non',
    examples: [
      {
        statement: 'SELECT bit_or(col) FROM VALUES (3), (5) AS tab(col);',
        result: '7',
      },
    ],
    name: 'bit_or',
  },
  {
    args: ['expr'],
    description: 'Returns the bitwise XOR of all non',
    examples: [
      {
        statement: 'SELECT bit_xor(col) FROM VALUES (3), (5) AS tab(col);',
        result: '6',
      },
    ],
    name: 'bit_xor',
  },
  {
    args: ['expr'],
    description: 'Returns true if all values of expr are true.',
    examples: [
      {
        statement:
          'SELECT bool_and(col) FROM VALUES (true), (true), (true) AS tab(col);',
        result: 'true',
      },
      {
        statement:
          'SELECT bool_and(col) FROM VALUES (NULL), (true), (true) AS tab(col);',
        result: 'true',
      },
      {
        statement:
          'SELECT bool_and(col) FROM VALUES (true), (false), (true) AS tab(col);',
        result: 'false',
      },
    ],
    name: 'bool_and',
  },
  {
    args: ['expr'],
    description: 'Returns true if at least one value of expr is true.',
    examples: [
      {
        statement:
          'SELECT bool_or(col) FROM VALUES (true), (false), (false) AS tab(col);',
        result: 'true',
      },
      {
        statement:
          'SELECT bool_or(col) FROM VALUES (NULL), (true), (false) AS tab(col);',
        result: 'true',
      },
      {
        statement:
          'SELECT bool_or(col) FROM VALUES (false), (false), (NULL) AS tab(col);',
        result: 'false',
      },
    ],
    name: 'bool_or',
  },
  {
    args: ['expr', 'd'],
    description:
      'Returns expr rounded to d decimal places using HALF_EVEN rounding mode.',
    examples: [
      {
        statement: 'SELECT bround(2.5, 0);',
        result: '2',
      },
      {
        statement: 'SELECT bround(25, -1);',
        result: '20',
      },
    ],
    name: 'bround',
  },
  {
    args: ['str'],
    description: 'Removes the leading and trailing space characters from str.',
    examples: [
      {
        statement: "SELECT btrim('    SparkSQL   ');",
        result: 'SparkSQL',
      },
      {
        statement: "SELECT btrim(encode('    SparkSQL   ', 'utf-8'));",
        result: 'SparkSQL',
      },
      {
        statement: "SELECT btrim('SSparkSQLS', 'SL');",
        result: 'parkSQ',
      },
      {
        statement:
          "SELECT btrim(encode('SSparkSQLS', 'utf-8'), encode('SL', 'utf-8'));",
        result: 'parkSQ',
      },
    ],
    name: 'btrim',
  },
  {
    args: ['expr'],
    description:
      'Returns the size of an array or a map.\nThe function returns null for null input if spark.sql.legacy.sizeOfNull is set to false or\nspark.sql.ansi.enabled is set to true. Otherwise, the function returns',
    examples: [
      {
        statement: "SELECT cardinality(array('b', 'd', 'c', 'a'));",
        result: '4',
      },
      {
        statement: "SELECT cardinality(map('a', 1, 'b', 2));",
        result: '2',
      },
    ],
    name: 'cardinality',
  },
  {
    args: ['exprAS type'],
    description: 'Casts the value expr to the target data type type.',
    examples: [
      {
        statement: "SELECT cast('10' as int);",
        result: '10',
      },
    ],
    name: 'cast',
  },
  {
    args: ['expr'],
    description: 'Returns the cube root of expr.',
    examples: [
      {
        statement: 'SELECT cbrt(27.0);',
        result: '3.0',
      },
    ],
    name: 'cbrt',
  },
  {
    args: ['expr[', 'scale]'],
    description:
      'Returns the smallest number after rounding up that is not smaller than expr. An optional scale parameter can be specified to control the rounding behavior.',
    examples: [
      {
        statement: 'SELECT ceil(-0.1);',
        result: '0',
      },
      {
        statement: 'SELECT ceil(5);',
        result: '5',
      },
      {
        statement: 'SELECT ceil(3.1411, 3);',
        result: '3.142',
      },
      {
        statement: 'SELECT ceil(3.1411, -3);',
        result: '1000',
      },
    ],
    name: 'ceil',
  },
  {
    args: ['expr[', 'scale]'],
    description:
      'Returns the smallest number after rounding up that is not smaller than expr. An optional scale parameter can be specified to control the rounding behavior.',
    examples: [
      {
        statement: 'SELECT ceiling(-0.1);',
        result: '0',
      },
      {
        statement: 'SELECT ceiling(5);',
        result: '5',
      },
      {
        statement: 'SELECT ceiling(3.1411, 3);',
        result: '3.142',
      },
      {
        statement: 'SELECT ceiling(3.1411, -3);',
        result: '1000',
      },
    ],
    name: 'ceiling',
  },
  {
    args: ['expr'],
    description:
      'Returns the ASCII character having the binary equivalent to expr. If n is larger than 256 the result is equivalent to chr(n % 256)',
    examples: [
      {
        statement: 'SELECT char(65);',
        result: 'A',
      },
    ],
    name: 'char',
  },
  {
    args: ['expr'],
    description:
      'Returns the character length of string data or number of bytes of binary data. The length of string data includes the trailing spaces. The length of binary data includes binary zeros.',
    examples: [
      {
        statement: "SELECT char_length('Spark SQL ');",
        result: '10',
      },
      {
        statement: "SELECT CHAR_LENGTH('Spark SQL ');",
        result: '10',
      },
      {
        statement: "SELECT CHARACTER_LENGTH('Spark SQL ');",
        result: '10',
      },
    ],
    name: 'char_length',
  },
  {
    args: ['expr'],
    description:
      'Returns the character length of string data or number of bytes of binary data. The length of string data includes the trailing spaces. The length of binary data includes binary zeros.',
    examples: [
      {
        statement: "SELECT character_length('Spark SQL ');",
        result: '10',
      },
      {
        statement: "SELECT CHAR_LENGTH('Spark SQL ');",
        result: '10',
      },
      {
        statement: "SELECT CHARACTER_LENGTH('Spark SQL ');",
        result: '10',
      },
    ],
    name: 'character_length',
  },
  {
    args: ['expr'],
    description:
      'Returns the ASCII character having the binary equivalent to expr. If n is larger than 256 the result is equivalent to chr(n % 256)',
    examples: [
      {
        statement: 'SELECT chr(65);',
        result: 'A',
      },
    ],
    name: 'chr',
  },
  {
    args: ['expr1', 'expr2', ' ...'],
    description: 'Returns the first non',
    examples: [
      {
        statement: 'SELECT coalesce(NULL, 1, NULL);',
        result: '1',
      },
    ],
    name: 'coalesce',
  },
  {
    args: ['expr'],
    description: 'Collects and returns a list of non',
    examples: [
      {
        statement:
          'SELECT collect_list(col) FROM VALUES (1), (2), (1) AS tab(col);',
        result: '[1,2,1]',
      },
    ],
    name: 'collect_list',
  },
  {
    args: ['expr'],
    description: 'Collects and returns a set of unique elements.',
    examples: [
      {
        statement:
          'SELECT collect_set(col) FROM VALUES (1), (2), (1) AS tab(col);',
        result: '[1,2]',
      },
    ],
    name: 'collect_set',
  },
  {
    args: ['col1', 'col2', ' ...', ' colN'],
    description: 'Returns the concatenation of col1, col2, ..., colN.',
    examples: [
      {
        statement: "SELECT concat('Spark', 'SQL');",
        result: 'SparkSQL',
      },
      {
        statement: 'SELECT concat(array(1, 2, 3), array(4, 5), array(6));',
        result: '[1,2,3,4,5,6]',
      },
    ],
    name: 'concat',
  },
  {
    args: ['sep[', 'str | array(str)]+'],
    description: 'Returns the concatenation of the strings separated by sep.',
    examples: [
      {
        statement: "SELECT concat_ws(' ', 'Spark', 'SQL');",
        result: 'Spark SQL',
      },
      {
        statement: "SELECT concat_ws('s');",
        result: '',
      },
    ],
    name: 'concat_ws',
  },
  {
    args: ['left', 'right'],
    description:
      'Returns a boolean. The value is True if right is found inside left.\nReturns NULL if either input expression is NULL. Otherwise, returns False.\nBoth left or right must be of STRING or BINARY type.',
    examples: [
      {
        statement: "SELECT contains('Spark SQL', 'Spark');",
        result: 'true',
      },
      {
        statement: "SELECT contains('Spark SQL', 'SPARK');",
        result: 'false',
      },
      {
        statement: "SELECT contains('Spark SQL', null);",
        result: 'NULL',
      },
      {
        statement: "SELECT contains(x'537061726b2053514c', x'537061726b');",
        result: 'true',
      },
    ],
    name: 'contains',
  },
  {
    args: ['num', 'from_base', ' to_base'],
    description: 'Convert num from from_base to to_base.',
    examples: [
      {
        statement: "SELECT conv('100', 2, 10);",
        result: '4',
      },
      {
        statement: 'SELECT conv(-10, 16, -10);',
        result: '-16',
      },
    ],
    name: 'conv',
  },
  {
    args: ['expr1', 'expr2'],
    description:
      'Returns Pearson coefficient of correlation between a set of number pairs.',
    examples: [
      {
        statement:
          'SELECT corr(c1, c2) FROM VALUES (3, 2), (3, 3), (6, 4) as tab(c1, c2);',
        result: '0.8660254037844387',
      },
    ],
    name: 'corr',
  },
  {
    args: ['expr'],
    description:
      'Returns the cosine of expr, as if computed by\njava.lang.Math.cos.',
    examples: [
      {
        statement: 'SELECT cos(0);',
        result: '1.0',
      },
    ],
    name: 'cos',
  },
  {
    args: ['expr'],
    description:
      'Returns the hyperbolic cosine of expr, as if computed by\njava.lang.Math.cosh.',
    examples: [
      {
        statement: 'SELECT cosh(0);',
        result: '1.0',
      },
    ],
    name: 'cosh',
  },
  {
    args: ['expr'],
    description:
      'Returns the cotangent of expr, as if computed by 1/java.lang.Math.tan.',
    examples: [
      {
        statement: 'SELECT cot(1);',
        result: '0.6420926159343306',
      },
    ],
    name: 'cot',
  },
  {
    args: ['*'],
    description:
      'Returns the total number of retrieved rows, including rows containing null.',
    examples: [
      {
        statement:
          'SELECT count(*) FROM VALUES (NULL), (5), (5), (20) AS tab(col);',
        result: '4',
      },
      {
        statement:
          'SELECT count(col) FROM VALUES (NULL), (5), (5), (20) AS tab(col);',
        result: '3',
      },
      {
        statement:
          'SELECT count(DISTINCT col) FROM VALUES (NULL), (5), (5), (10) AS tab(col);',
        result: '2',
      },
    ],
    name: 'count',
  },
  {
    args: ['expr'],
    description: 'Returns the number of TRUE values for the expression.',
    examples: [
      {
        statement:
          'SELECT count_if(col % 2 = 0) FROM VALUES (NULL), (0), (1), (2), (3) AS tab(col);',
        result: '2',
      },
      {
        statement:
          'SELECT count_if(col IS NULL) FROM VALUES (NULL), (0), (1), (2), (3) AS tab(col);',
        result: '1',
      },
    ],
    name: 'count_if',
  },
  {
    args: ['col', 'eps', ' confidence', ' seed'],
    description: 'Returns a count',
    examples: [
      {
        statement:
          'SELECT hex(count_min_sketch(col, 0.5d, 0.5d, 1)) FROM VALUES (1), (2), (1) AS tab(col);',
        result:
          '0000000100000000000000030000000100000004000000005D8D6AB90000000000000000000000000000000200000000000000010000000000000000',
      },
    ],
    name: 'count_min_sketch',
  },
  {
    args: ['expr1', 'expr2'],
    description: 'Returns the population covariance of a set of number pairs.',
    examples: [
      {
        statement:
          'SELECT covar_pop(c1, c2) FROM VALUES (1,1), (2,2), (3,3) AS tab(c1, c2);',
        result: '0.6666666666666666',
      },
    ],
    name: 'covar_pop',
  },
  {
    args: ['expr1', 'expr2'],
    description: 'Returns the sample covariance of a set of number pairs.',
    examples: [
      {
        statement:
          'SELECT covar_samp(c1, c2) FROM VALUES (1,1), (2,2), (3,3) AS tab(c1, c2);',
        result: '1.0',
      },
    ],
    name: 'covar_samp',
  },
  {
    args: ['expr'],
    description:
      'Returns a cyclic redundancy check value of the expr as a bigint.',
    examples: [
      {
        statement: "SELECT crc32('Spark');",
        result: '1557323817',
      },
    ],
    name: 'crc32',
  },
  {
    args: ['expr'],
    description:
      'Returns the cosecant of expr, as if computed by 1/java.lang.Math.sin.',
    examples: [
      {
        statement: 'SELECT csc(1);',
        result: '1.1883951057781212',
      },
    ],
    name: 'csc',
  },
  {
    description:
      'Computes the position of a value relative to all values in the partition.',
    examples: [
      {
        statement:
          "SELECT a, b, cume_dist() OVER (PARTITION BY a ORDER BY b) FROM VALUES ('A1', 2), ('A1', 1), ('A2', 3), ('A1', 1) tab(a, b);",
        result:
          'A1 1   0.6666666666666666\n A1 1   0.6666666666666666\n A1 2   1.0\n A2 3   1.0',
      },
    ],
    name: 'cume_dist',
  },
  {
    description: 'Returns the current catalog.',
    examples: [
      {
        statement: 'SELECT current_catalog();',
        result: 'spark_catalog',
      },
    ],
    name: 'current_catalog',
  },
  {
    description: 'Returns the current database.',
    examples: [
      {
        statement: 'SELECT current_database();',
        result: 'default',
      },
    ],
    name: 'current_database',
  },
  {
    description:
      'Returns the current date at the start of query evaluation. All calls of current_date within the same query return the same value.',
    examples: [
      {
        statement: 'SELECT current_date();',
        result: '2020-04-25',
      },
      {
        statement: 'SELECT current_date;',
        result: '2020-04-25',
      },
    ],
    name: 'current_date',
  },
  {
    description:
      'Returns the current timestamp at the start of query evaluation. All calls of current_timestamp within the same query return the same value.',
    examples: [
      {
        statement: 'SELECT current_timestamp();',
        result: '2020-04-25 15:49:11.914',
      },
      {
        statement: 'SELECT current_timestamp;',
        result: '2020-04-25 15:49:11.914',
      },
    ],
    name: 'current_timestamp',
  },
  {
    description: 'Returns the current session local timezone.',
    examples: [
      {
        statement: 'SELECT current_timezone();',
        result: 'Asia/Shanghai',
      },
    ],
    name: 'current_timezone',
  },
  {
    description: 'user name of current execution context.',
    examples: [
      {
        statement: 'SELECT current_user();',
        result: 'mockingjay',
      },
    ],
    name: 'current_user',
  },
  {
    args: ['start_date', 'num_days'],
    description: 'Returns the date that is num_days after start_date.',
    examples: [
      {
        statement: "SELECT date_add('2016-07-30', 1);",
        result: '2016-07-31',
      },
    ],
    name: 'date_add',
  },
  {
    args: ['timestamp', 'fmt'],
    description:
      'Converts timestamp to a value of string in the format specified by the date format fmt.',
    examples: [
      {
        statement: "SELECT date_format('2016-04-08', 'y');",
        result: '2016',
      },
    ],
    name: 'date_format',
  },
  {
    args: ['days'],
    description: 'Create date from the number of days since 1970',
    examples: [
      {
        statement: 'SELECT date_from_unix_date(1);',
        result: '1970-01-02',
      },
    ],
    name: 'date_from_unix_date',
  },
  {
    args: ['field', 'source'],
    description: 'Extracts a part of the date/timestamp or interval source.',
    examples: [
      {
        statement:
          "SELECT date_part('YEAR', TIMESTAMP '2019-08-12 01:00:00.123456');",
        result: '2019',
      },
      {
        statement:
          "SELECT date_part('week', timestamp'2019-08-12 01:00:00.123456');",
        result: '33',
      },
      {
        statement: "SELECT date_part('doy', DATE'2019-08-12');",
        result: '224',
      },
      {
        statement:
          "SELECT date_part('SECONDS', timestamp'2019-10-01 00:00:01.000001');",
        result: '1.000001',
      },
      {
        statement:
          "SELECT date_part('days', interval 5 days 3 hours 7 minutes);",
        result: '5',
      },
      {
        statement:
          "SELECT date_part('seconds', interval 5 hours 30 seconds 1 milliseconds 1 microseconds);",
        result: '30.001001',
      },
      {
        statement:
          "SELECT date_part('MONTH', INTERVAL '2021-11' YEAR TO MONTH);",
        result: '11',
      },
      {
        statement:
          "SELECT date_part('MINUTE', INTERVAL '123 23:55:59.002001' DAY TO SECOND);",
        result: '55',
      },
    ],
    name: 'date_part',
  },
  {
    args: ['start_date', 'num_days'],
    description: 'Returns the date that is num_days before start_date.',
    examples: [
      {
        statement: "SELECT date_sub('2016-07-30', 1);",
        result: '2016-07-29',
      },
    ],
    name: 'date_sub',
  },
  {
    args: ['fmt', 'ts'],
    description:
      'Returns timestamp ts truncated to the unit specified by the format model fmt.',
    examples: [
      {
        statement: "SELECT date_trunc('YEAR', '2015-03-05T09:32:05.359');",
        result: '2015-01-01 00:00:00',
      },
      {
        statement: "SELECT date_trunc('MM', '2015-03-05T09:32:05.359');",
        result: '2015-03-01 00:00:00',
      },
      {
        statement: "SELECT date_trunc('DD', '2015-03-05T09:32:05.359');",
        result: '2015-03-05 00:00:00',
      },
      {
        statement: "SELECT date_trunc('HOUR', '2015-03-05T09:32:05.359');",
        result: '2015-03-05 09:00:00',
      },
      {
        statement:
          "SELECT date_trunc('MILLISECOND', '2015-03-05T09:32:05.123456');",
        result: '2015-03-05 09:32:05.123',
      },
    ],
    name: 'date_trunc',
  },
  {
    args: ['endDate', 'startDate'],
    description: 'Returns the number of days from startDate to endDate.',
    examples: [
      {
        statement: "SELECT datediff('2009-07-31', '2009-07-30');",
        result: '1',
      },
      {
        statement: "SELECT datediff('2009-07-30', '2009-07-31');",
        result: '-1',
      },
    ],
    name: 'datediff',
  },
  {
    args: ['date'],
    description: 'Returns the day of month of the date/timestamp.',
    examples: [
      {
        statement: "SELECT day('2009-07-30');",
        result: '30',
      },
    ],
    name: 'day',
  },
  {
    args: ['date'],
    description: 'Returns the day of month of the date/timestamp.',
    examples: [
      {
        statement: "SELECT dayofmonth('2009-07-30');",
        result: '30',
      },
    ],
    name: 'dayofmonth',
  },
  {
    args: ['date'],
    description:
      'Returns the day of the week for date/timestamp (1 = Sunday, 2 = Monday, ..., 7 = Saturday).',
    examples: [
      {
        statement: "SELECT dayofweek('2009-07-30');",
        result: '5',
      },
    ],
    name: 'dayofweek',
  },
  {
    args: ['date'],
    description: 'Returns the day of year of the date/timestamp.',
    examples: [
      {
        statement: "SELECT dayofyear('2016-04-09');",
        result: '100',
      },
    ],
    name: 'dayofyear',
  },
  {
    args: ['bin', 'charset'],
    description:
      'Decodes the first argument using the second argument character set.',
    examples: [
      {
        statement: "SELECT decode(encode('abc', 'utf-8'), 'utf-8');",
        result: 'abc',
      },
      {
        statement:
          "SELECT decode(2, 1, 'Southlake', 2, 'San Francisco', 3, 'New Jersey', 4, 'Seattle', 'Non domestic');",
        result: 'San Francisco',
      },
      {
        statement:
          "SELECT decode(6, 1, 'Southlake', 2, 'San Francisco', 3, 'New Jersey', 4, 'Seattle', 'Non domestic');",
        result: 'Non domestic',
      },
      {
        statement:
          "SELECT decode(6, 1, 'Southlake', 2, 'San Francisco', 3, 'New Jersey', 4, 'Seattle');",
        result: 'NULL',
      },
    ],
    name: 'decode',
  },
  {
    args: ['expr'],
    description: 'Converts radians to degrees.',
    examples: [
      {
        statement: 'SELECT degrees(3.141592653589793);',
        result: '180.0',
      },
    ],
    name: 'degrees',
  },
  {
    description:
      'Computes the rank of a value in a group of values. The result is one plus the\npreviously assigned rank value. Unlike the function rank, dense_rank will not produce gaps\nin the ranking sequence.',
    examples: [
      {
        statement:
          "SELECT a, b, dense_rank(b) OVER (PARTITION BY a ORDER BY b) FROM VALUES ('A1', 2), ('A1', 1), ('A2', 3), ('A1', 1) tab(a, b);",
        result: 'A1 1   1\n A1 1   1\n A1 2   2\n A2 3   1',
      },
    ],
    name: 'dense_rank',
  },
  {
    description: "Returns Euler's number, e.",
    examples: [
      {
        statement: 'SELECT e();',
        result: '2.718281828459045',
      },
    ],
    name: 'e',
  },
  {
    args: ['array', 'index'],
    description: 'Returns element of array at given (1',
    examples: [
      {
        statement: 'SELECT element_at(array(1, 2, 3), 2);',
        result: '2',
      },
      {
        statement: "SELECT element_at(map(1, 'a', 2, 'b'), 2);",
        result: 'b',
      },
    ],
    name: 'element_at',
  },
  {
    args: ['n', 'input1', ' input2', ' ...'],
    description: 'Returns the n',
    examples: [
      {
        statement: "SELECT elt(1, 'scala', 'java');",
        result: 'scala',
      },
    ],
    name: 'elt',
  },
  {
    args: ['str', 'charset'],
    description:
      'Encodes the first argument using the second argument character set.',
    examples: [
      {
        statement: "SELECT encode('abc', 'utf-8');",
        result: 'abc',
      },
    ],
    name: 'encode',
  },
  {
    args: ['left', 'right'],
    description:
      'Returns a boolean. The value is True if left ends with right.\nReturns NULL if either input expression is NULL. Otherwise, returns False.\nBoth left or right must be of STRING or BINARY type.',
    examples: [
      {
        statement: "SELECT endswith('Spark SQL', 'SQL');",
        result: 'true',
      },
      {
        statement: "SELECT endswith('Spark SQL', 'Spark');",
        result: 'false',
      },
      {
        statement: "SELECT endswith('Spark SQL', null);",
        result: 'NULL',
      },
      {
        statement: "SELECT endswith(x'537061726b2053514c', x'537061726b');",
        result: 'false',
      },
      {
        statement: "SELECT endswith(x'537061726b2053514c', x'53514c');",
        result: 'true',
      },
    ],
    name: 'endswith',
  },
  {
    args: ['expr'],
    description: 'Returns true if all values of expr are true.',
    examples: [
      {
        statement:
          'SELECT every(col) FROM VALUES (true), (true), (true) AS tab(col);',
        result: 'true',
      },
      {
        statement:
          'SELECT every(col) FROM VALUES (NULL), (true), (true) AS tab(col);',
        result: 'true',
      },
      {
        statement:
          'SELECT every(col) FROM VALUES (true), (false), (true) AS tab(col);',
        result: 'false',
      },
    ],
    name: 'every',
  },
  {
    args: ['expr', 'pred'],
    description:
      'Tests whether a predicate holds for one or more elements in the array.',
    examples: [
      {
        statement: 'SELECT exists(array(1, 2, 3), x -> x % 2 == 0);',
        result: 'true',
      },
      {
        statement: 'SELECT exists(array(1, 2, 3), x -> x % 2 == 10);',
        result: 'false',
      },
      {
        statement: 'SELECT exists(array(1, null, 3), x -> x % 2 == 0);',
        result: 'NULL',
      },
      {
        statement: 'SELECT exists(array(0, null, 2, 3, null), x -> x IS NULL);',
        result: 'true',
      },
      {
        statement: 'SELECT exists(array(1, 2, 3), x -> x IS NULL);',
        result: 'false',
      },
    ],
    name: 'exists',
  },
  {
    args: ['expr'],
    description: 'Returns e to the power of expr.',
    examples: [
      {
        statement: 'SELECT exp(0);',
        result: '1.0',
      },
    ],
    name: 'exp',
  },
  {
    args: ['expr'],
    description:
      'Separates the elements of array expr into multiple rows, or the elements of map expr into multiple rows and columns. Unless specified otherwise, uses the default column name col for elements of the array or key and value for the elements of the map.',
    examples: [
      {
        statement: 'SELECT explode(array(10, 20));',
        result: '10\n 20',
      },
    ],
    name: 'explode',
  },
  {
    args: ['expr'],
    description:
      'Separates the elements of array expr into multiple rows, or the elements of map expr into multiple rows and columns. Unless specified otherwise, uses the default column name col for elements of the array or key and value for the elements of the map.',
    examples: [
      {
        statement: 'SELECT explode_outer(array(10, 20));',
        result: '10\n 20',
      },
    ],
    name: 'explode_outer',
  },
  {
    args: ['expr'],
    description: 'Returns exp(expr)',
    examples: [
      {
        statement: 'SELECT expm1(0);',
        result: '0.0',
      },
    ],
    name: 'expm1',
  },
  {
    args: ['fieldFROM source'],
    description: 'Extracts a part of the date/timestamp or interval source.',
    examples: [
      {
        statement:
          "SELECT extract(YEAR FROM TIMESTAMP '2019-08-12 01:00:00.123456');",
        result: '2019',
      },
      {
        statement:
          "SELECT extract(week FROM timestamp'2019-08-12 01:00:00.123456');",
        result: '33',
      },
      {
        statement: "SELECT extract(doy FROM DATE'2019-08-12');",
        result: '224',
      },
      {
        statement:
          "SELECT extract(SECONDS FROM timestamp'2019-10-01 00:00:01.000001');",
        result: '1.000001',
      },
      {
        statement:
          'SELECT extract(days FROM interval 5 days 3 hours 7 minutes);',
        result: '5',
      },
      {
        statement:
          'SELECT extract(seconds FROM interval 5 hours 30 seconds 1 milliseconds 1 microseconds);',
        result: '30.001001',
      },
      {
        statement:
          "SELECT extract(MONTH FROM INTERVAL '2021-11' YEAR TO MONTH);",
        result: '11',
      },
      {
        statement:
          "SELECT extract(MINUTE FROM INTERVAL '123 23:55:59.002001' DAY TO SECOND);",
        result: '55',
      },
    ],
    name: 'extract',
  },
  {
    args: ['expr'],
    description:
      'Returns the factorial of expr. expr is [0..20]. Otherwise, null.',
    examples: [
      {
        statement: 'SELECT factorial(5);',
        result: '120',
      },
    ],
    name: 'factorial',
  },
  {
    args: ['expr', 'func'],
    description: 'Filters the input array using the given predicate.',
    examples: [
      {
        statement: 'SELECT filter(array(1, 2, 3), x -> x % 2 == 1);',
        result: '[1,3]',
      },
      {
        statement: 'SELECT filter(array(0, 2, 3), (x, i) -> x > i);',
        result: '[2,3]',
      },
      {
        statement:
          'SELECT filter(array(0, null, 2, 3, null), x -> x IS NOT NULL);',
        result: '[0,2,3]',
      },
    ],
    name: 'filter',
  },
  {
    args: ['str', 'str_array'],
    description: 'Returns the index (1',
    examples: [
      {
        statement: "SELECT find_in_set('ab','abc,b,ab,c,def');",
        result: '3',
      },
    ],
    name: 'find_in_set',
  },
  {
    args: ['expr[', 'isIgnoreNull]'],
    description:
      'Returns the first value of expr for a group of rows.\nIf isIgnoreNull is true, returns only non',
    examples: [
      {
        statement: 'SELECT first(col) FROM VALUES (10), (5), (20) AS tab(col);',
        result: '10',
      },
      {
        statement:
          'SELECT first(col) FROM VALUES (NULL), (5), (20) AS tab(col);',
        result: 'NULL',
      },
      {
        statement:
          'SELECT first(col, true) FROM VALUES (NULL), (5), (20) AS tab(col);',
        result: '5',
      },
    ],
    name: 'first',
  },
  {
    args: ['expr[', 'isIgnoreNull]'],
    description:
      'Returns the first value of expr for a group of rows.\nIf isIgnoreNull is true, returns only non',
    examples: [
      {
        statement:
          'SELECT first_value(col) FROM VALUES (10), (5), (20) AS tab(col);',
        result: '10',
      },
      {
        statement:
          'SELECT first_value(col) FROM VALUES (NULL), (5), (20) AS tab(col);',
        result: 'NULL',
      },
      {
        statement:
          'SELECT first_value(col, true) FROM VALUES (NULL), (5), (20) AS tab(col);',
        result: '5',
      },
    ],
    name: 'first_value',
  },
  {
    args: ['arrayOfArrays'],
    description: 'Transforms an array of arrays into a single array.',
    examples: [
      {
        statement: 'SELECT flatten(array(array(1, 2), array(3, 4)));',
        result: '[1,2,3,4]',
      },
    ],
    name: 'flatten',
  },
  {
    args: ['expr[', 'scale]'],
    description:
      'Returns the largest number after rounding down that is not greater than expr. An optional scale parameter can be specified to control the rounding behavior.',
    examples: [
      {
        statement: 'SELECT floor(-0.1);',
        result: '-1',
      },
      {
        statement: 'SELECT floor(5);',
        result: '5',
      },
      {
        statement: 'SELECT floor(3.1411, 3);',
        result: '3.141',
      },
      {
        statement: 'SELECT floor(3.1411, -3);',
        result: '0',
      },
    ],
    name: 'floor',
  },
  {
    args: ['expr', 'pred'],
    description:
      'Tests whether a predicate holds for all elements in the array.',
    examples: [
      {
        statement: 'SELECT forall(array(1, 2, 3), x -> x % 2 == 0);',
        result: 'false',
      },
      {
        statement: 'SELECT forall(array(2, 4, 8), x -> x % 2 == 0);',
        result: 'true',
      },
      {
        statement: 'SELECT forall(array(1, null, 3), x -> x % 2 == 0);',
        result: 'false',
      },
      {
        statement: 'SELECT forall(array(2, null, 8), x -> x % 2 == 0);',
        result: 'NULL',
      },
    ],
    name: 'forall',
  },
  {
    args: ['expr1', 'expr2'],
    description:
      "Formats the number expr1 like '#,###,###.##', rounded to expr2\ndecimal places. If expr2 is 0, the result has no decimal point or fractional part.\nexpr2 also accept a user specified format.\nThis is supposed to function like MySQL's FORMAT.",
    examples: [
      {
        statement: 'SELECT format_number(12332.123456, 4);',
        result: '12,332.1235',
      },
      {
        statement:
          "SELECT format_number(12332.123456, '##################.###');",
        result: '12332.123',
      },
    ],
    name: 'format_number',
  },
  {
    args: ['strfmt', 'obj', ' ...'],
    description: 'Returns a formatted string from printf',
    examples: [
      {
        statement: 'SELECT format_string("Hello World %d %s", 100, "days");',
        result: 'Hello World 100 days',
      },
    ],
    name: 'format_string',
  },
  {
    args: ['csvStr', 'schema[', ' options]'],
    description: 'Returns a struct value with the given csvStr and schema.',
    examples: [
      {
        statement: "SELECT from_csv('1, 0.8', 'a INT, b DOUBLE');",
        result: '{"a":1,"b":0.8}',
      },
      {
        statement:
          "SELECT from_csv('26/08/2015', 'time Timestamp', map('timestampFormat', 'dd/MM/yyyy'));",
        result: '{"time":2015-08-26 00:00:00}',
      },
    ],
    name: 'from_csv',
  },
  {
    args: ['jsonStr', 'schema[', ' options]'],
    description: 'Returns a struct value with the given jsonStr and schema.',
    examples: [
      {
        statement:
          'SELECT from_json(\'{"a":1, "b":0.8}\', \'a INT, b DOUBLE\');',
        result: '{"a":1,"b":0.8}',
      },
      {
        statement:
          "SELECT from_json('{\"time\":\"26/08/2015\"}', 'time Timestamp', map('timestampFormat', 'dd/MM/yyyy'));",
        result: '{"time":2015-08-26 00:00:00}',
      },
      {
        statement:
          'SELECT from_json(\'{"teacher": "Alice", "student": [{"name": "Bob", "rank": 1}, {"name": "Charlie", "rank": 2}]}\', \'STRUCT<teacher: STRING, student: ARRAY<STRUCT<name: STRING, rank: INT>>>\');',
        result:
          '{"teacher":"Alice","student":[{"name":"Bob","rank":1},{"name":"Charlie","rank":2}]}',
      },
    ],
    name: 'from_json',
  },
  {
    args: ['unix_time[', 'fmt]'],
    description: 'Returns unix_time in the specified fmt.',
    examples: [
      {
        statement: "SELECT from_unixtime(0, 'yyyy-MM-dd HH:mm:ss');",
        result: '1969-12-31 16:00:00',
      },
      {
        statement: 'SELECT from_unixtime(0);',
        result: '1969-12-31 16:00:00',
      },
    ],
    name: 'from_unixtime',
  },
  {
    args: ['timestamp', 'timezone'],
    description: "Given a timestamp like '2017",
    examples: [
      {
        statement: "SELECT from_utc_timestamp('2016-08-31', 'Asia/Seoul');",
        result: '2016-08-31 09:00:00',
      },
    ],
    name: 'from_utc_timestamp',
  },
  {
    args: ['json_txt', 'path'],
    description: 'Extracts a json object from path.',
    examples: [
      {
        statement: 'SELECT get_json_object(\'{"a":"b"}\', \'$.a\');',
        result: 'b',
      },
    ],
    name: 'get_json_object',
  },
  {
    args: ['expr', 'pos'],
    description:
      'Returns the value of the bit (0 or 1) at the specified position.\nThe positions are numbered from right to left, starting at zero.\nThe position argument cannot be negative.',
    examples: [
      {
        statement: 'SELECT getbit(11, 0);',
        result: '1',
      },
      {
        statement: 'SELECT getbit(11, 2);',
        result: '0',
      },
    ],
    name: 'getbit',
  },
  {
    args: ['expr', '...'],
    description:
      'Returns the greatest value of all parameters, skipping null values.',
    examples: [
      {
        statement: 'SELECT greatest(10, 9, 2, 4, 3);',
        result: '10',
      },
    ],
    name: 'greatest',
  },
  {
    args: ['col'],
    description:
      'indicates whether a specified column in a GROUP BY is aggregated or\nnot, returns 1 for aggregated or 0 for not aggregated in the result set.",',
    examples: [
      {
        statement:
          "SELECT name, grouping(name), sum(age) FROM VALUES (2, 'Alice'), (5, 'Bob') people(age, name) GROUP BY cube(name);",
        result: 'Alice 0   2\n  Bob   0   5\n  NULL  1   7',
      },
    ],
    name: 'grouping',
  },
  {
    args: ['[col1[', 'col2 ..]]'],
    description:
      'returns the level of grouping, equals to\n(grouping(c1) << (n',
    examples: [
      {
        statement:
          "SELECT name, grouping_id(), sum(age), avg(height) FROM VALUES (2, 'Alice', 165), (5, 'Bob', 180) people(age, name, height) GROUP BY cube(name, height);",
        result:
          'Alice 0   2   165.0\n  Alice 1   2   165.0\n  NULL  3   7   172.5\n  Bob   0   5   180.0\n  Bob   1   5   180.0\n  NULL  2   2   165.0\n  NULL  2   5   180.0',
      },
    ],
    name: 'grouping_id',
  },
  {
    args: ['expr1', 'expr2', ' ...'],
    description: 'Returns a hash value of the arguments.',
    examples: [
      {
        statement: "SELECT hash('Spark', array(123), 2);",
        result: '-1321691492',
      },
    ],
    name: 'hash',
  },
  {
    args: ['expr'],
    description: 'Converts expr to hexadecimal.',
    examples: [
      {
        statement: 'SELECT hex(17);',
        result: '11',
      },
      {
        statement: "SELECT hex('Spark SQL');",
        result: '537061726B2053514C',
      },
    ],
    name: 'hex',
  },
  {
    args: ['expr', 'nb'],
    description:
      "Computes a histogram on numeric 'expr' using nb bins.\nThe return value is an array of (x,y) pairs representing the centers of the\nhistogram's bins. As the value of 'nb' is increased, the histogram approximation\ngets finer",
    examples: [
      {
        statement:
          'SELECT histogram_numeric(col, 5) FROM VALUES (0), (1), (2), (10) AS tab(col);',
        result:
          '[{"x":0,"y":1.0},{"x":1,"y":1.0},{"x":2,"y":1.0},{"x":10,"y":1.0}]',
      },
    ],
    name: 'histogram_numeric',
  },
  {
    args: ['timestamp'],
    description: 'Returns the hour component of the string/timestamp.',
    examples: [
      {
        statement: "SELECT hour('2009-07-30 12:58:59');",
        result: '12',
      },
    ],
    name: 'hour',
  },
  {
    args: ['expr1', 'expr2'],
    description: 'Returns sqrt(expr12 + expr22).',
    examples: [
      {
        statement: 'SELECT hypot(3, 4);',
        result: '5.0',
      },
    ],
    name: 'hypot',
  },
  {
    args: ['expr1', 'expr2', ' expr3'],
    description:
      'If expr1 evaluates to true, then returns expr2; otherwise returns expr3.',
    examples: [
      {
        statement: "SELECT if(1 < 2, 'a', 'b');",
        result: 'a',
      },
    ],
    name: 'if',
  },
  {
    args: ['expr1', 'expr2'],
    description: 'Returns expr2 if expr1 is null, or expr1 otherwise.',
    examples: [
      {
        statement: "SELECT ifnull(NULL, array('2'));",
        result: '["2"]',
      },
    ],
    name: 'ifnull',
  },
  {
    args: ['expr2', 'expr3', ' ...'],
    description: 'Returns true if expr equals to any valN.',
    examples: [
      {
        statement: 'SELECT 1 in(1, 2, 3);',
        result: 'true',
      },
      {
        statement: 'SELECT 1 in(2, 3, 4);',
        result: 'false',
      },
      {
        statement:
          "SELECT named_struct('a', 1, 'b', 2) in(named_struct('a', 1, 'b', 1), named_struct('a', 1, 'b', 3));",
        result: 'false',
      },
      {
        statement:
          "SELECT named_struct('a', 1, 'b', 2) in(named_struct('a', 1, 'b', 2), named_struct('a', 1, 'b', 3));",
        result: 'true',
      },
    ],
    name: 'expr1 in',
  },
  {
    args: ['str'],
    description:
      'Returns str with the first letter of each word in uppercase.\nAll other letters are in lowercase. Words are delimited by white space.',
    examples: [
      {
        statement: "SELECT initcap('sPark sql');",
        result: 'Spark Sql',
      },
    ],
    name: 'initcap',
  },
  {
    args: ['expr'],
    description:
      'Explodes an array of structs into a table. Uses column names col1, col2, etc. by default unless specified otherwise.',
    examples: [
      {
        statement: "SELECT inline(array(struct(1, 'a'), struct(2, 'b')));",
        result: '1  a\n 2  b',
      },
    ],
    name: 'inline',
  },
  {
    args: ['expr'],
    description:
      'Explodes an array of structs into a table. Uses column names col1, col2, etc. by default unless specified otherwise.',
    examples: [
      {
        statement:
          "SELECT inline_outer(array(struct(1, 'a'), struct(2, 'b')));",
        result: '1  a\n 2  b',
      },
    ],
    name: 'inline_outer',
  },
  {
    description: 'Returns the length of the block being read, or',
    examples: [
      {
        statement: 'SELECT input_file_block_length();',
        result: '-1',
      },
    ],
    name: 'input_file_block_length',
  },
  {
    description: 'Returns the start offset of the block being read, or',
    examples: [
      {
        statement: 'SELECT input_file_block_start();',
        result: '-1',
      },
    ],
    name: 'input_file_block_start',
  },
  {
    description:
      'Returns the name of the file being read, or empty string if not available.',
    examples: [
      {
        statement: 'SELECT input_file_name();',
        result: '',
      },
    ],
    name: 'input_file_name',
  },
  {
    args: ['str', 'substr'],
    description: 'Returns the (1',
    examples: [
      {
        statement: "SELECT instr('SparkSQL', 'SQL');",
        result: '6',
      },
    ],
    name: 'instr',
  },
  {
    args: ['expr'],
    description: 'Returns true if expr is NaN, or false otherwise.',
    examples: [
      {
        statement: "SELECT isnan(cast('NaN' as double));",
        result: 'true',
      },
    ],
    name: 'isnan',
  },
  {
    args: ['expr'],
    description: 'Returns true if expr is not null, or false otherwise.',
    examples: [
      {
        statement: 'SELECT isnotnull(1);',
        result: 'true',
      },
    ],
    name: 'isnotnull',
  },
  {
    args: ['expr'],
    description: 'Returns true if expr is null, or false otherwise.',
    examples: [
      {
        statement: 'SELECT isnull(1);',
        result: 'false',
      },
    ],
    name: 'isnull',
  },
  {
    args: ['jsonArray'],
    description: 'Returns the number of elements in the outermost JSON array.',
    examples: [
      {
        statement: "SELECT json_array_length('[1,2,3,4]');",
        result: '4',
      },
      {
        statement:
          'SELECT json_array_length(\'[1,2,3,{"f1":1,"f2":[5,6]},4]\');',
        result: '5',
      },
      {
        statement: "SELECT json_array_length('[1,2');",
        result: 'NULL',
      },
    ],
    name: 'json_array_length',
  },
  {
    args: ['json_object'],
    description:
      'Returns all the keys of the outermost JSON object as an array.',
    examples: [
      {
        statement: "SELECT json_object_keys('{}');",
        result: '[]',
      },
      {
        statement: 'SELECT json_object_keys(\'{"key": "value"}\');',
        result: '["key"]',
      },
      {
        statement:
          'SELECT json_object_keys(\'{"f1":"abc","f2":{"f3":"a", "f4":"b"}}\');',
        result: '["f1","f2"]',
      },
    ],
    name: 'json_object_keys',
  },
  {
    args: ['jsonStr', 'p1', ' p2', ' ...', ' pn'],
    description:
      'Returns a tuple like the function get_json_object, but it takes multiple names. All the input parameters and output column types are string.',
    examples: [
      {
        statement: "SELECT json_tuple('{\"a\":1, \"b\":2}', 'a', 'b');",
        result: '1  2',
      },
    ],
    name: 'json_tuple',
  },
  {
    args: ['expr'],
    description:
      'Returns the kurtosis value calculated from values of a group.',
    examples: [
      {
        statement:
          'SELECT kurtosis(col) FROM VALUES (-10), (-20), (100), (1000) AS tab(col);',
        result: '-0.7014368047529627',
      },
      {
        statement:
          'SELECT kurtosis(col) FROM VALUES (1), (10), (100), (10), (1) as tab(col);',
        result: '0.19432323191699075',
      },
    ],
    name: 'kurtosis',
  },
  {
    args: ['input[', 'offset[', ' default]]'],
    description:
      'Returns the value of input at the offsetth row\nbefore the current row in the window. The default value of offset is 1 and the default\nvalue of default is null. If the value of input at the offsetth row is null,\nnull is returned. If there is no such offset row (e.g., when the offset is 1, the first\nrow of the window does not have any previous row), default is returned.',
    examples: [
      {
        statement:
          "SELECT a, b, lag(b) OVER (PARTITION BY a ORDER BY b) FROM VALUES ('A1', 2), ('A1', 1), ('A2', 3), ('A1', 1) tab(a, b);",
        result: 'A1 1   NULL\n A1 1   1\n A1 2   1\n A2 3   NULL',
      },
    ],
    name: 'lag',
  },
  {
    args: ['expr[', 'isIgnoreNull]'],
    description:
      'Returns the last value of expr for a group of rows.\nIf isIgnoreNull is true, returns only non',
    examples: [
      {
        statement: 'SELECT last(col) FROM VALUES (10), (5), (20) AS tab(col);',
        result: '20',
      },
      {
        statement:
          'SELECT last(col) FROM VALUES (10), (5), (NULL) AS tab(col);',
        result: 'NULL',
      },
      {
        statement:
          'SELECT last(col, true) FROM VALUES (10), (5), (NULL) AS tab(col);',
        result: '5',
      },
    ],
    name: 'last',
  },
  {
    args: ['date'],
    description: 'Returns the last day of the month which the date belongs to.',
    examples: [
      {
        statement: "SELECT last_day('2009-01-12');",
        result: '2009-01-31',
      },
    ],
    name: 'last_day',
  },
  {
    args: ['expr[', 'isIgnoreNull]'],
    description:
      'Returns the last value of expr for a group of rows.\nIf isIgnoreNull is true, returns only non',
    examples: [
      {
        statement:
          'SELECT last_value(col) FROM VALUES (10), (5), (20) AS tab(col);',
        result: '20',
      },
      {
        statement:
          'SELECT last_value(col) FROM VALUES (10), (5), (NULL) AS tab(col);',
        result: 'NULL',
      },
      {
        statement:
          'SELECT last_value(col, true) FROM VALUES (10), (5), (NULL) AS tab(col);',
        result: '5',
      },
    ],
    name: 'last_value',
  },
  {
    args: ['str'],
    description: 'Returns str with all characters changed to lowercase.',
    examples: [
      {
        statement: "SELECT lcase('SparkSql');",
        result: 'sparksql',
      },
    ],
    name: 'lcase',
  },
  {
    args: ['input[', 'offset[', ' default]]'],
    description:
      'Returns the value of input at the offsetth row\nafter the current row in the window. The default value of offset is 1 and the default\nvalue of default is null. If the value of input at the offsetth row is null,\nnull is returned. If there is no such an offset row (e.g., when the offset is 1, the last\nrow of the window does not have any subsequent row), default is returned.',
    examples: [
      {
        statement:
          "SELECT a, b, lead(b) OVER (PARTITION BY a ORDER BY b) FROM VALUES ('A1', 2), ('A1', 1), ('A2', 3), ('A1', 1) tab(a, b);",
        result: 'A1 1   1\n A1 1   2\n A1 2   NULL\n A2 3   NULL',
      },
    ],
    name: 'lead',
  },
  {
    args: ['expr', '...'],
    description:
      'Returns the least value of all parameters, skipping null values.',
    examples: [
      {
        statement: 'SELECT least(10, 9, 2, 4, 3);',
        result: '2',
      },
    ],
    name: 'least',
  },
  {
    args: ['str', 'len'],
    description:
      'Returns the leftmost len(len can be string type) characters from the string str,if len is less or equal than 0 the result is an empty string.',
    examples: [
      {
        statement: "SELECT left('Spark SQL', 3);",
        result: 'Spa',
      },
    ],
    name: 'left',
  },
  {
    args: ['expr'],
    description:
      'Returns the character length of string data or number of bytes of binary data. The length of string data includes the trailing spaces. The length of binary data includes binary zeros.',
    examples: [
      {
        statement: "SELECT length('Spark SQL ');",
        result: '10',
      },
      {
        statement: "SELECT CHAR_LENGTH('Spark SQL ');",
        result: '10',
      },
      {
        statement: "SELECT CHARACTER_LENGTH('Spark SQL ');",
        result: '10',
      },
    ],
    name: 'length',
  },
  {
    args: ['str1', 'str2'],
    description:
      'Returns the Levenshtein distance between the two given strings.',
    examples: [
      {
        statement: "SELECT levenshtein('kitten', 'sitting');",
        result: '3',
      },
    ],
    name: 'levenshtein',
  },
  {
    args: ['expr'],
    description: 'Returns the natural logarithm (base e) of expr.',
    examples: [
      {
        statement: 'SELECT ln(1);',
        result: '0.0',
      },
    ],
    name: 'ln',
  },
  {
    args: ['substr', 'str[', ' pos]'],
    description:
      'Returns the position of the first occurrence of substr in str after position pos.\nThe given pos and return value are 1',
    examples: [
      {
        statement: "SELECT locate('bar', 'foobarbar');",
        result: '4',
      },
      {
        statement: "SELECT locate('bar', 'foobarbar', 5);",
        result: '7',
      },
      {
        statement: "SELECT POSITION('bar' IN 'foobarbar');",
        result: '4',
      },
    ],
    name: 'locate',
  },
  {
    args: ['base', 'expr'],
    description: 'Returns the logarithm of expr with base.',
    examples: [
      {
        statement: 'SELECT log(10, 100);',
        result: '2.0',
      },
    ],
    name: 'log',
  },
  {
    args: ['expr'],
    description: 'Returns the logarithm of expr with base 10.',
    examples: [
      {
        statement: 'SELECT log10(10);',
        result: '1.0',
      },
    ],
    name: 'log10',
  },
  {
    args: ['expr'],
    description: 'Returns log(1 + expr).',
    examples: [
      {
        statement: 'SELECT log1p(0);',
        result: '0.0',
      },
    ],
    name: 'log1p',
  },
  {
    args: ['expr'],
    description: 'Returns the logarithm of expr with base 2.',
    examples: [
      {
        statement: 'SELECT log2(2);',
        result: '1.0',
      },
    ],
    name: 'log2',
  },
  {
    args: ['str'],
    description: 'Returns str with all characters changed to lowercase.',
    examples: [
      {
        statement: "SELECT lower('SparkSql');",
        result: 'sparksql',
      },
    ],
    name: 'lower',
  },
  {
    args: ['str', 'len[', ' pad]'],
    description: 'Returns str, left',
    examples: [
      {
        statement: "SELECT lpad('hi', 5, '??');",
        result: '???hi',
      },
      {
        statement: "SELECT lpad('hi', 1, '??');",
        result: 'h',
      },
      {
        statement: "SELECT lpad('hi', 5);",
        result: 'hi',
      },
      {
        statement: "SELECT hex(lpad(unhex('aabb'), 5));",
        result: '000000AABB',
      },
      {
        statement: "SELECT hex(lpad(unhex('aabb'), 5, unhex('1122')));",
        result: '112211AABB',
      },
    ],
    name: 'lpad',
  },
  {
    args: ['str'],
    description: 'Removes the leading space characters from str.',
    examples: [
      {
        statement: "SELECT ltrim('    SparkSQL   ');",
        result: 'SparkSQL',
      },
    ],
    name: 'ltrim',
  },
  {
    args: ['year', 'month', ' day'],
    description:
      'Create date from year, month and day fields. If the configuration spark.sql.ansi.enabled is false, the function returns NULL on invalid inputs. Otherwise, it will throw an error instead.',
    examples: [
      {
        statement: 'SELECT make_date(2013, 7, 15);',
        result: '2013-07-15',
      },
      {
        statement: 'SELECT make_date(2019, 7, NULL);',
        result: 'NULL',
      },
    ],
    name: 'make_date',
  },
  {
    args: ['[days[', 'hours[', ' mins[', ' secs]]]]'],
    description:
      'Make DayTimeIntervalType duration from days, hours, mins and secs.',
    examples: [
      {
        statement: 'SELECT make_dt_interval(1, 12, 30, 01.001001);',
        result: '1 12:30:01.001001000',
      },
      {
        statement: 'SELECT make_dt_interval(2);',
        result: '2 00:00:00.000000000',
      },
      {
        statement: 'SELECT make_dt_interval(100, null, 3);',
        result: 'NULL',
      },
    ],
    name: 'make_dt_interval',
  },
  {
    args: [
      '[years[',
      'months[',
      ' weeks[',
      ' days[',
      ' hours[',
      ' mins[',
      ' secs]]]]]]]',
    ],
    description:
      'Make interval from years, months, weeks, days, hours, mins and secs.',
    examples: [
      {
        statement: 'SELECT make_interval(100, 11, 1, 1, 12, 30, 01.001001);',
        result:
          '100 years 11 months 8 days 12 hours 30 minutes 1.001001 seconds',
      },
      {
        statement: 'SELECT make_interval(100, null, 3);',
        result: 'NULL',
      },
      {
        statement: 'SELECT make_interval(0, 1, 0, 1, 0, 0, 100.000001);',
        result: '1 months 1 days 1 minutes 40.000001 seconds',
      },
    ],
    name: 'make_interval',
  },
  {
    args: ['year', 'month', ' day', ' hour', ' min', ' sec[', ' timezone]'],
    description:
      'Create timestamp from year, month, day, hour, min, sec and timezone fields. The result data type is consistent with the value of configuration spark.sql.timestampType. If the configuration spark.sql.ansi.enabled is false, the function returns NULL on invalid inputs. Otherwise, it will throw an error instead.',
    examples: [
      {
        statement: 'SELECT make_timestamp(2014, 12, 28, 6, 30, 45.887);',
        result: '2014-12-28 06:30:45.887',
      },
      {
        statement: "SELECT make_timestamp(2014, 12, 28, 6, 30, 45.887, 'CET');",
        result: '2014-12-27 21:30:45.887',
      },
      {
        statement: 'SELECT make_timestamp(2019, 6, 30, 23, 59, 60);',
        result: '2019-07-01 00:00:00',
      },
      {
        statement: 'SELECT make_timestamp(2019, 6, 30, 23, 59, 1);',
        result: '2019-06-30 23:59:01',
      },
      {
        statement: 'SELECT make_timestamp(null, 7, 22, 15, 30, 0);',
        result: 'NULL',
      },
    ],
    name: 'make_timestamp',
  },
  {
    args: ['[years[', 'months]]'],
    description: 'Make year',
    examples: [
      {
        statement: 'SELECT make_ym_interval(1, 2);',
        result: '1-2',
      },
      {
        statement: 'SELECT make_ym_interval(1, 0);',
        result: '1-0',
      },
      {
        statement: 'SELECT make_ym_interval(-1, 1);',
        result: '-0-11',
      },
      {
        statement: 'SELECT make_ym_interval(2);',
        result: '2-0',
      },
    ],
    name: 'make_ym_interval',
  },
  {
    args: ['key0', 'value0', ' key1', ' value1', ' ...'],
    description: 'Creates a map with the given key/value pairs.',
    examples: [
      {
        statement: "SELECT map(1.0, '2', 3.0, '4');",
        result: '{1.0:"2",3.0:"4"}',
      },
    ],
    name: 'map',
  },
  {
    args: ['map', '...'],
    description: 'Returns the union of all the given maps',
    examples: [
      {
        statement: "SELECT map_concat(map(1, 'a', 2, 'b'), map(3, 'c'));",
        result: '{1:"a",2:"b",3:"c"}',
      },
    ],
    name: 'map_concat',
  },
  {
    args: ['map', 'key'],
    description: 'Returns true if the map contains the key.',
    examples: [
      {
        statement: "SELECT map_contains_key(map(1, 'a', 2, 'b'), 1);",
        result: 'true',
      },
      {
        statement: "SELECT map_contains_key(map(1, 'a', 2, 'b'), 3);",
        result: 'false',
      },
    ],
    name: 'map_contains_key',
  },
  {
    args: ['map'],
    description: 'Returns an unordered array of all entries in the given map.',
    examples: [
      {
        statement: "SELECT map_entries(map(1, 'a', 2, 'b'));",
        result: '[{"key":1,"value":"a"},{"key":2,"value":"b"}]',
      },
    ],
    name: 'map_entries',
  },
  {
    args: ['expr', 'func'],
    description: 'Filters entries in a map using the function.',
    examples: [
      {
        statement:
          'SELECT map_filter(map(1, 0, 2, 2, 3, -1), (k, v) -> k > v);',
        result: '{1:0,3:-1}',
      },
    ],
    name: 'map_filter',
  },
  {
    args: ['keys', 'values'],
    description:
      'Creates a map with a pair of the given key/value arrays. All elements\nin keys should not be null',
    examples: [
      {
        statement: "SELECT map_from_arrays(array(1.0, 3.0), array('2', '4'));",
        result: '{1.0:"2",3.0:"4"}',
      },
    ],
    name: 'map_from_arrays',
  },
  {
    args: ['arrayOfEntries'],
    description: 'Returns a map created from the given array of entries.',
    examples: [
      {
        statement:
          "SELECT map_from_entries(array(struct(1, 'a'), struct(2, 'b')));",
        result: '{1:"a",2:"b"}',
      },
    ],
    name: 'map_from_entries',
  },
  {
    args: ['map'],
    description: 'Returns an unordered array containing the keys of the map.',
    examples: [
      {
        statement: "SELECT map_keys(map(1, 'a', 2, 'b'));",
        result: '[1,2]',
      },
    ],
    name: 'map_keys',
  },
  {
    args: ['map'],
    description: 'Returns an unordered array containing the values of the map.',
    examples: [
      {
        statement: "SELECT map_values(map(1, 'a', 2, 'b'));",
        result: '["a","b"]',
      },
    ],
    name: 'map_values',
  },
  {
    args: ['map1', 'map2', ' function'],
    description:
      'Merges two given maps into a single map by applying\nfunction to the pair of values with the same key. For keys only presented in one map,\nNULL will be passed as the value for the missing key. If an input map contains duplicated\nkeys, only the first entry of the duplicated key is passed into the lambda function.',
    examples: [
      {
        statement:
          "SELECT map_zip_with(map(1, 'a', 2, 'b'), map(1, 'x', 2, 'y'), (k, v1, v2) -> concat(v1, v2));",
        result: '{1:"ax",2:"by"}',
      },
    ],
    name: 'map_zip_with',
  },
  {
    args: ['expr'],
    description: 'Returns the maximum value of expr.',
    examples: [
      {
        statement: 'SELECT max(col) FROM VALUES (10), (50), (20) AS tab(col);',
        result: '50',
      },
    ],
    name: 'max',
  },
  {
    args: ['x', 'y'],
    description:
      'Returns the value of x associated with the maximum value of y.',
    examples: [
      {
        statement:
          "SELECT max_by(x, y) FROM VALUES (('a', 10)), (('b', 50)), (('c', 20)) AS tab(x, y);",
        result: 'b',
      },
    ],
    name: 'max_by',
  },
  {
    args: ['expr'],
    description: 'Returns an MD5 128',
    examples: [
      {
        statement: "SELECT md5('Spark');",
        result: '8cde774d6f7333752ed72cacddb05126',
      },
    ],
    name: 'md5',
  },
  {
    args: ['expr'],
    description: 'Returns the mean calculated from values of a group.',
    examples: [
      {
        statement: 'SELECT mean(col) FROM VALUES (1), (2), (3) AS tab(col);',
        result: '2.0',
      },
      {
        statement: 'SELECT mean(col) FROM VALUES (1), (2), (NULL) AS tab(col);',
        result: '1.5',
      },
    ],
    name: 'mean',
  },
  {
    args: ['expr'],
    description: 'Returns the minimum value of expr.',
    examples: [
      {
        statement: 'SELECT min(col) FROM VALUES (10), (-1), (20) AS tab(col);',
        result: '-1',
      },
    ],
    name: 'min',
  },
  {
    args: ['x', 'y'],
    description:
      'Returns the value of x associated with the minimum value of y.',
    examples: [
      {
        statement:
          "SELECT min_by(x, y) FROM VALUES (('a', 10)), (('b', 50)), (('c', 20)) AS tab(x, y);",
        result: 'a',
      },
    ],
    name: 'min_by',
  },
  {
    args: ['timestamp'],
    description: 'Returns the minute component of the string/timestamp.',
    examples: [
      {
        statement: "SELECT minute('2009-07-30 12:58:59');",
        result: '58',
      },
    ],
    name: 'minute',
  },
  {
    description: 'Returns monotonically increasing 64',
    examples: [
      {
        statement: 'SELECT monotonically_increasing_id();',
        result: '0',
      },
    ],
    name: 'monotonically_increasing_id',
  },
  {
    args: ['date'],
    description: 'Returns the month component of the date/timestamp.',
    examples: [
      {
        statement: "SELECT month('2016-07-30');",
        result: '7',
      },
    ],
    name: 'month',
  },
  {
    args: ['timestamp1', 'timestamp2[', ' roundOff]'],
    description:
      'If timestamp1 is later than timestamp2, then the result\nis positive. If timestamp1 and timestamp2 are on the same day of month, or both\nare the last day of month, time of day will be ignored. Otherwise, the difference is\ncalculated based on 31 days per month, and rounded to 8 digits unless roundOff=false.',
    examples: [
      {
        statement:
          "SELECT months_between('1997-02-28 10:30:00', '1996-10-30');",
        result: '3.94959677',
      },
      {
        statement:
          "SELECT months_between('1997-02-28 10:30:00', '1996-10-30', false);",
        result: '3.9495967741935485',
      },
    ],
    name: 'months_between',
  },
  {
    args: ['name1', 'val1', ' name2', ' val2', ' ...'],
    description: 'Creates a struct with the given field names and values.',
    examples: [
      {
        statement: 'SELECT named_struct("a", 1, "b", 2, "c", 3);',
        result: '{"a":1,"b":2,"c":3}',
      },
    ],
    name: 'named_struct',
  },
  {
    args: ['expr1', 'expr2'],
    description: "Returns expr1 if it's not NaN, or expr2 otherwise.",
    examples: [
      {
        statement: "SELECT nanvl(cast('NaN' as double), 123);",
        result: '123.0',
      },
    ],
    name: 'nanvl',
  },
  {
    args: ['expr'],
    description: 'Returns the negated value of expr.',
    examples: [
      {
        statement: 'SELECT negative(1);',
        result: '-1',
      },
    ],
    name: 'negative',
  },
  {
    args: ['start_date', 'day_of_week'],
    description:
      'Returns the first date which is later than start_date and named as indicated.\nThe function returns NULL if at least one of the input parameters is NULL.\nWhen both of the input parameters are not NULL and day_of_week is an invalid input,\nthe function throws IllegalArgumentException if spark.sql.ansi.enabled is set to true, otherwise NULL.',
    examples: [
      {
        statement: "SELECT next_day('2015-01-14', 'TU');",
        result: '2015-01-20',
      },
    ],
    name: 'next_day',
  },
  {
    description:
      'Returns the current timestamp at the start of query evaluation.',
    examples: [
      {
        statement: 'SELECT now();',
        result: '2020-04-25 15:49:11.914',
      },
    ],
    name: 'now',
  },
  {
    args: ['input[', 'offset]'],
    description:
      'Returns the value of input at the row that is the offsetth row\nfrom beginning of the window frame. Offset starts at 1. If ignoreNulls=true, we will skip\nnulls when finding the offsetth row. Otherwise, every row counts for the offset. If\nthere is no such an offsetth row (e.g., when the offset is 10, size of the window frame\nis less than 10), null is returned.',
    examples: [
      {
        statement:
          "SELECT a, b, nth_value(b, 2) OVER (PARTITION BY a ORDER BY b) FROM VALUES ('A1', 2), ('A1', 1), ('A2', 3), ('A1', 1) tab(a, b);",
        result: 'A1 1   1\n A1 1   1\n A1 2   1\n A2 3   NULL',
      },
    ],
    name: 'nth_value',
  },
  {
    args: ['n'],
    description:
      'Divides the rows for each window partition into n buckets ranging\nfrom 1 to at most n.',
    examples: [
      {
        statement:
          "SELECT a, b, ntile(2) OVER (PARTITION BY a ORDER BY b) FROM VALUES ('A1', 2), ('A1', 1), ('A2', 3), ('A1', 1) tab(a, b);",
        result: 'A1 1   1\n A1 1   1\n A1 2   2\n A2 3   1',
      },
    ],
    name: 'ntile',
  },
  {
    args: ['expr1', 'expr2'],
    description: 'Returns null if expr1 equals to expr2, or expr1 otherwise.',
    examples: [
      {
        statement: 'SELECT nullif(2, 2);',
        result: 'NULL',
      },
    ],
    name: 'nullif',
  },
  {
    args: ['expr1', 'expr2'],
    description: 'Returns expr2 if expr1 is null, or expr1 otherwise.',
    examples: [
      {
        statement: "SELECT nvl(NULL, array('2'));",
        result: '["2"]',
      },
    ],
    name: 'nvl',
  },
  {
    args: ['expr1', 'expr2', ' expr3'],
    description: 'Returns expr2 if expr1 is not null, or expr3 otherwise.',
    examples: [
      {
        statement: 'SELECT nvl2(NULL, 2, 1);',
        result: '1',
      },
    ],
    name: 'nvl2',
  },
  {
    args: ['expr'],
    description:
      'Returns the byte length of string data or number of bytes of binary data.',
    examples: [
      {
        statement: "SELECT octet_length('Spark SQL');",
        result: '9',
      },
    ],
    name: 'octet_length',
  },
  {
    args: ['input', 'replace', ' pos[', ' len]'],
    description:
      'Replace input with replace that starts at pos and is of length len.',
    examples: [
      {
        statement: "SELECT overlay('Spark SQL' PLACING '_' FROM 6);",
        result: 'Spark_SQL',
      },
      {
        statement: "SELECT overlay('Spark SQL' PLACING 'CORE' FROM 7);",
        result: 'Spark CORE',
      },
      {
        statement: "SELECT overlay('Spark SQL' PLACING 'ANSI ' FROM 7 FOR 0);",
        result: 'Spark ANSI SQL',
      },
      {
        statement:
          "SELECT overlay('Spark SQL' PLACING 'tructured' FROM 2 FOR 4);",
        result: 'Structured SQL',
      },
      {
        statement:
          "SELECT overlay(encode('Spark SQL', 'utf-8') PLACING encode('_', 'utf-8') FROM 6);",
        result: 'Spark_SQL',
      },
      {
        statement:
          "SELECT overlay(encode('Spark SQL', 'utf-8') PLACING encode('CORE', 'utf-8') FROM 7);",
        result: 'Spark CORE',
      },
      {
        statement:
          "SELECT overlay(encode('Spark SQL', 'utf-8') PLACING encode('ANSI ', 'utf-8') FROM 7 FOR 0);",
        result: 'Spark ANSI SQL',
      },
      {
        statement:
          "SELECT overlay(encode('Spark SQL', 'utf-8') PLACING encode('tructured', 'utf-8') FROM 2 FOR 4);",
        result: 'Structured SQL',
      },
    ],
    name: 'overlay',
  },
  {
    args: ['url', 'partToExtract[', ' key]'],
    description: 'Extracts a part from a URL.',
    examples: [
      {
        statement:
          "SELECT parse_url('http://spark.apache.org/path?query=1', 'HOST');",
        result: 'spark.apache.org',
      },
      {
        statement:
          "SELECT parse_url('http://spark.apache.org/path?query=1', 'QUERY');",
        result: 'query=1',
      },
      {
        statement:
          "SELECT parse_url('http://spark.apache.org/path?query=1', 'QUERY', 'query');",
        result: '1',
      },
    ],
    name: 'parse_url',
  },
  {
    description:
      'Computes the percentage ranking of a value in a group of values.',
    examples: [
      {
        statement:
          "SELECT a, b, percent_rank(b) OVER (PARTITION BY a ORDER BY b) FROM VALUES ('A1', 2), ('A1', 1), ('A2', 3), ('A1', 1) tab(a, b);",
        result: 'A1 1   0.0\n A1 1   0.0\n A1 2   1.0\n A2 3   0.0',
      },
    ],
    name: 'percent_rank',
  },
  {
    args: ['col', 'percentage [', ' frequency]'],
    description:
      'Returns the exact percentile value of numeric\ncolumn col at the given percentage. The value of percentage must be\nbetween 0.0 and 1.0. The value of frequency should be positive integral\npercentile(col, array(percentage1 [, percentage2]...) [, frequency])',
    examples: [
      {
        statement:
          'SELECT percentile(col, 0.3) FROM VALUES (0), (10) AS tab(col);',
        result: '3.0',
      },
      {
        statement:
          'SELECT percentile(col, array(0.25, 0.75)) FROM VALUES (0), (10) AS tab(col);',
        result: '[2.5,7.5]',
      },
    ],
    name: 'percentile',
  },
  {
    args: ['col', 'percentage [', ' accuracy]'],
    description:
      'Returns the approximate percentile of the numeric or\nansi interval column col which is the smallest value in the ordered col values (sorted\nfrom least to greatest) such that no more than percentage of col values is less than\nthe value or equal to that value. The value of percentage must be between 0.0 and 1.0.\nThe accuracy parameter (default: 10000) is a positive numeric literal which controls\napproximation accuracy at the cost of memory. Higher value of accuracy yields better\naccuracy, 1.0/accuracy is the relative error of the approximation.\nWhen percentage is an array, each value of the percentage array must be between 0.0 and 1.0.\nIn this case, returns the approximate percentile array of column col at the given\npercentage array.',
    examples: [
      {
        statement:
          'SELECT percentile_approx(col, array(0.5, 0.4, 0.1), 100) FROM VALUES (0), (1), (2), (10) AS tab(col);',
        result: '[1,1,0]',
      },
      {
        statement:
          'SELECT percentile_approx(col, 0.5, 100) FROM VALUES (0), (6), (7), (9), (10) AS tab(col);',
        result: '7',
      },
      {
        statement:
          "SELECT percentile_approx(col, 0.5, 100) FROM VALUES (INTERVAL '0' MONTH), (INTERVAL '1' MONTH), (INTERVAL '2' MONTH), (INTERVAL '10' MONTH) AS tab(col);",
        result: '0-1',
      },
      {
        statement:
          "SELECT percentile_approx(col, array(0.5, 0.7), 100) FROM VALUES (INTERVAL '0' SECOND), (INTERVAL '1' SECOND), (INTERVAL '2' SECOND), (INTERVAL '10' SECOND) AS tab(col);",
        result: '[0 00:00:01.000000000,0 00:00:02.000000000]',
      },
    ],
    name: 'percentile_approx',
  },
  {
    description: 'Returns pi.',
    examples: [
      {
        statement: 'SELECT pi();',
        result: '3.141592653589793',
      },
    ],
    name: 'pi',
  },
  {
    args: ['expr1', 'expr2'],
    description: 'Returns the positive value of expr1 mod expr2.',
    examples: [
      {
        statement: 'SELECT pmod(10, 3);',
        result: '1',
      },
      {
        statement: 'SELECT pmod(-10, 3);',
        result: '2',
      },
    ],
    name: 'pmod',
  },
  {
    args: ['expr'],
    description:
      'Separates the elements of array expr into multiple rows with positions, or the elements of map expr into multiple rows and columns with positions. Unless specified otherwise, uses the column name pos for position, col for elements of the array or key and value for elements of the map.',
    examples: [
      {
        statement: 'SELECT posexplode(array(10,20));',
        result: '0  10\n 1  20',
      },
    ],
    name: 'posexplode',
  },
  {
    args: ['expr'],
    description:
      'Separates the elements of array expr into multiple rows with positions, or the elements of map expr into multiple rows and columns with positions. Unless specified otherwise, uses the column name pos for position, col for elements of the array or key and value for elements of the map.',
    examples: [
      {
        statement: 'SELECT posexplode_outer(array(10,20));',
        result: '0  10\n 1  20',
      },
    ],
    name: 'posexplode_outer',
  },
  {
    args: ['substr', 'str[', ' pos]'],
    description:
      'Returns the position of the first occurrence of substr in str after position pos.\nThe given pos and return value are 1',
    examples: [
      {
        statement: "SELECT position('bar', 'foobarbar');",
        result: '4',
      },
      {
        statement: "SELECT position('bar', 'foobarbar', 5);",
        result: '7',
      },
      {
        statement: "SELECT POSITION('bar' IN 'foobarbar');",
        result: '4',
      },
    ],
    name: 'position',
  },
  {
    args: ['expr'],
    description: 'Returns the value of expr.',
    examples: [
      {
        statement: 'SELECT positive(1);',
        result: '1',
      },
    ],
    name: 'positive',
  },
  {
    args: ['expr1', 'expr2'],
    description: 'Raises expr1 to the power of expr2.',
    examples: [
      {
        statement: 'SELECT pow(2, 3);',
        result: '8.0',
      },
    ],
    name: 'pow',
  },
  {
    args: ['expr1', 'expr2'],
    description: 'Raises expr1 to the power of expr2.',
    examples: [
      {
        statement: 'SELECT power(2, 3);',
        result: '8.0',
      },
    ],
    name: 'power',
  },
  {
    args: ['strfmt', 'obj', ' ...'],
    description: 'Returns a formatted string from printf',
    examples: [
      {
        statement: 'SELECT printf("Hello World %d %s", 100, "days");',
        result: 'Hello World 100 days',
      },
    ],
    name: 'printf',
  },
  {
    args: ['date'],
    description:
      'Returns the quarter of the year for date, in the range 1 to 4.',
    examples: [
      {
        statement: "SELECT quarter('2016-08-31');",
        result: '3',
      },
    ],
    name: 'quarter',
  },
  {
    args: ['expr'],
    description: 'Converts degrees to radians.',
    examples: [
      {
        statement: 'SELECT radians(180);',
        result: '3.141592653589793',
      },
    ],
    name: 'radians',
  },
  {
    args: ['expr'],
    description: 'Throws an exception with expr.',
    examples: [
      {
        statement: "SELECT raise_error('custom error message');",
        result: 'java.lang.RuntimeException\n custom error message',
      },
    ],
    name: 'raise_error',
  },
  {
    args: ['[seed]'],
    description:
      'Returns a random value with independent and identically distributed (i.i.d.) uniformly distributed values in [0, 1).',
    examples: [
      {
        statement: 'SELECT rand();',
        result: '0.9629742951434543',
      },
      {
        statement: 'SELECT rand(0);',
        result: '0.7604953758285915',
      },
      {
        statement: 'SELECT rand(null);',
        result: '0.7604953758285915',
      },
    ],
    name: 'rand',
  },
  {
    args: ['[seed]'],
    description:
      'Returns a random value with independent and identically distributed (i.i.d.) values drawn from the standard normal distribution.',
    examples: [
      {
        statement: 'SELECT randn();',
        result: '-0.3254147983080288',
      },
      {
        statement: 'SELECT randn(0);',
        result: '1.6034991609278433',
      },
      {
        statement: 'SELECT randn(null);',
        result: '1.6034991609278433',
      },
    ],
    name: 'randn',
  },
  {
    args: ['[seed]'],
    description:
      'Returns a random value with independent and identically distributed (i.i.d.) uniformly distributed values in [0, 1).',
    examples: [
      {
        statement: 'SELECT random();',
        result: '0.9629742951434543',
      },
      {
        statement: 'SELECT random(0);',
        result: '0.7604953758285915',
      },
      {
        statement: 'SELECT random(null);',
        result: '0.7604953758285915',
      },
    ],
    name: 'random',
  },
  {
    description:
      'Computes the rank of a value in a group of values. The result is one plus the number\nof rows preceding or equal to the current row in the ordering of the partition. The values\nwill produce gaps in the sequence.',
    examples: [
      {
        statement:
          "SELECT a, b, rank(b) OVER (PARTITION BY a ORDER BY b) FROM VALUES ('A1', 2), ('A1', 1), ('A2', 3), ('A1', 1) tab(a, b);",
        result: 'A1 1   1\n A1 1   1\n A1 2   3\n A2 3   1',
      },
    ],
    name: 'rank',
  },
  {
    args: ['str', 'regexp'],
    description: 'Returns true if str matches regexp, or false otherwise.',
    examples: [
      {
        statement: 'SET spark.sql.parser.escapedStringLiterals=true;',
        result: 'spark.sql.parser.escapedStringLiterals  true',
      },
      {
        statement:
          "SELECT regexp('%SystemDrive%\\Users\\John', '%SystemDrive%\\\\Users.*');",
        result: 'true',
      },
      {
        statement: 'SET spark.sql.parser.escapedStringLiterals=false;',
        result: 'spark.sql.parser.escapedStringLiterals  false',
      },
      {
        statement:
          "SELECT regexp('%SystemDrive%\\\\Users\\\\John', '%SystemDrive%\\\\\\\\Users.*');",
        result: 'true',
      },
    ],
    name: 'regexp',
  },
  {
    args: ['str', 'regexp[', ' idx]'],
    description:
      'Extract the first string in the str that match the regexp\nexpression and corresponding to the regex group index.',
    examples: [
      {
        statement: "SELECT regexp_extract('100-200', '(\\\\d+)-(\\\\d+)', 1);",
        result: '100',
      },
    ],
    name: 'regexp_extract',
  },
  {
    args: ['str', 'regexp[', ' idx]'],
    description:
      'Extract all strings in the str that match the regexp\nexpression and corresponding to the regex group index.',
    examples: [
      {
        statement:
          "SELECT regexp_extract_all('100-200, 300-400', '(\\\\d+)-(\\\\d+)', 1);",
        result: '["100","300"]',
      },
    ],
    name: 'regexp_extract_all',
  },
  {
    args: ['str', 'regexp'],
    description: 'Returns true if str matches regexp, or false otherwise.',
    examples: [
      {
        statement: 'SET spark.sql.parser.escapedStringLiterals=true;',
        result: 'spark.sql.parser.escapedStringLiterals  true',
      },
      {
        statement:
          "SELECT regexp_like('%SystemDrive%\\Users\\John', '%SystemDrive%\\\\Users.*');",
        result: 'true',
      },
      {
        statement: 'SET spark.sql.parser.escapedStringLiterals=false;',
        result: 'spark.sql.parser.escapedStringLiterals  false',
      },
      {
        statement:
          "SELECT regexp_like('%SystemDrive%\\\\Users\\\\John', '%SystemDrive%\\\\\\\\Users.*');",
        result: 'true',
      },
    ],
    name: 'regexp_like',
  },
  {
    args: ['str', 'regexp', ' rep[', ' position]'],
    description: 'Replaces all substrings of str that match regexp with rep.',
    examples: [
      {
        statement: "SELECT regexp_replace('100-200', '(\\\\d+)', 'num');",
        result: 'num-num',
      },
    ],
    name: 'regexp_replace',
  },
  {
    args: ['y', 'x'],
    description: 'Returns the average of the independent variable for non',
    examples: [
      {
        statement:
          'SELECT regr_avgx(y, x) FROM VALUES (1, 2), (2, 2), (2, 3), (2, 4) AS tab(y, x);',
        result: '2.75',
      },
      {
        statement: 'SELECT regr_avgx(y, x) FROM VALUES (1, null) AS tab(y, x);',
        result: 'NULL',
      },
      {
        statement: 'SELECT regr_avgx(y, x) FROM VALUES (null, 1) AS tab(y, x);',
        result: 'NULL',
      },
      {
        statement:
          'SELECT regr_avgx(y, x) FROM VALUES (1, 2), (2, null), (2, 3), (2, 4) AS tab(y, x);',
        result: '3.0',
      },
      {
        statement:
          'SELECT regr_avgx(y, x) FROM VALUES (1, 2), (2, null), (null, 3), (2, 4) AS tab(y, x);',
        result: '3.0',
      },
    ],
    name: 'regr_avgx',
  },
  {
    args: ['y', 'x'],
    description: 'Returns the average of the dependent variable for non',
    examples: [
      {
        statement:
          'SELECT regr_avgy(y, x) FROM VALUES (1, 2), (2, 2), (2, 3), (2, 4) AS tab(y, x);',
        result: '1.75',
      },
      {
        statement: 'SELECT regr_avgy(y, x) FROM VALUES (1, null) AS tab(y, x);',
        result: 'NULL',
      },
      {
        statement: 'SELECT regr_avgy(y, x) FROM VALUES (null, 1) AS tab(y, x);',
        result: 'NULL',
      },
      {
        statement:
          'SELECT regr_avgy(y, x) FROM VALUES (1, 2), (2, null), (2, 3), (2, 4) AS tab(y, x);',
        result: '1.6666666666666667',
      },
      {
        statement:
          'SELECT regr_avgy(y, x) FROM VALUES (1, 2), (2, null), (null, 3), (2, 4) AS tab(y, x);',
        result: '1.5',
      },
    ],
    name: 'regr_avgy',
  },
  {
    args: ['y', 'x'],
    description: 'Returns the number of non',
    examples: [
      {
        statement:
          'SELECT regr_count(y, x) FROM VALUES (1, 2), (2, 2), (2, 3), (2, 4) AS tab(y, x);',
        result: '4',
      },
      {
        statement:
          'SELECT regr_count(y, x) FROM VALUES (1, 2), (2, null), (2, 3), (2, 4) AS tab(y, x);',
        result: '3',
      },
      {
        statement:
          'SELECT regr_count(y, x) FROM VALUES (1, 2), (2, null), (null, 3), (2, 4) AS tab(y, x);',
        result: '2',
      },
    ],
    name: 'regr_count',
  },
  {
    args: ['y', 'x'],
    description: 'Returns the coefficient of determination for non',
    examples: [
      {
        statement:
          'SELECT regr_r2(y, x) FROM VALUES (1, 2), (2, 2), (2, 3), (2, 4) AS tab(y, x);',
        result: '0.2727272727272727',
      },
      {
        statement: 'SELECT regr_r2(y, x) FROM VALUES (1, null) AS tab(y, x);',
        result: 'NULL',
      },
      {
        statement: 'SELECT regr_r2(y, x) FROM VALUES (null, 1) AS tab(y, x);',
        result: 'NULL',
      },
      {
        statement:
          'SELECT regr_r2(y, x) FROM VALUES (1, 2), (2, null), (2, 3), (2, 4) AS tab(y, x);',
        result: '0.7500000000000001',
      },
      {
        statement:
          'SELECT regr_r2(y, x) FROM VALUES (1, 2), (2, null), (null, 3), (2, 4) AS tab(y, x);',
        result: '1.0',
      },
    ],
    name: 'regr_r2',
  },
  {
    args: ['str', 'n'],
    description:
      'Returns the string which repeats the given string value n times.',
    examples: [
      {
        statement: "SELECT repeat('123', 2);",
        result: '123123',
      },
    ],
    name: 'repeat',
  },
  {
    args: ['str', 'search[', ' replace]'],
    description: 'Replaces all occurrences of search with replace.',
    examples: [
      {
        statement: "SELECT replace('ABCabc', 'abc', 'DEF');",
        result: 'ABCDEF',
      },
    ],
    name: 'replace',
  },
  {
    args: ['array'],
    description:
      'Returns a reversed string or an array with reverse order of elements.',
    examples: [
      {
        statement: "SELECT reverse('Spark SQL');",
        result: 'LQS krapS',
      },
      {
        statement: 'SELECT reverse(array(2, 1, 4, 3));',
        result: '[3,4,1,2]',
      },
    ],
    name: 'reverse',
  },
  {
    args: ['str', 'len'],
    description:
      'Returns the rightmost len(len can be string type) characters from the string str,if len is less or equal than 0 the result is an empty string.',
    examples: [
      {
        statement: "SELECT right('Spark SQL', 3);",
        result: 'SQL',
      },
    ],
    name: 'right',
  },
  {
    args: ['expr'],
    description:
      'Returns the double value that is closest in value to the argument and is equal to a mathematical integer.',
    examples: [
      {
        statement: 'SELECT rint(12.3456);',
        result: '12.0',
      },
    ],
    name: 'rint',
  },
  {
    args: ['str', 'regexp'],
    description: 'Returns true if str matches regexp, or false otherwise.',
    examples: [
      {
        statement: 'SET spark.sql.parser.escapedStringLiterals=true;',
        result: 'spark.sql.parser.escapedStringLiterals  true',
      },
      {
        statement:
          "SELECT rlike('%SystemDrive%\\Users\\John', '%SystemDrive%\\\\Users.*');",
        result: 'true',
      },
      {
        statement: 'SET spark.sql.parser.escapedStringLiterals=false;',
        result: 'spark.sql.parser.escapedStringLiterals  false',
      },
      {
        statement:
          "SELECT rlike('%SystemDrive%\\\\Users\\\\John', '%SystemDrive%\\\\\\\\Users.*');",
        result: 'true',
      },
    ],
    name: 'rlike',
  },
  {
    args: ['expr', 'd'],
    description:
      'Returns expr rounded to d decimal places using HALF_UP rounding mode.',
    examples: [
      {
        statement: 'SELECT round(2.5, 0);',
        result: '3',
      },
      {
        statement: 'SELECT round(25, -1);',
        result: '30',
      },
    ],
    name: 'round',
  },
  {
    description:
      'Assigns a unique, sequential number to each row, starting with one,\naccording to the ordering of rows within the window partition.',
    examples: [
      {
        statement:
          "SELECT a, b, row_number() OVER (PARTITION BY a ORDER BY b) FROM VALUES ('A1', 2), ('A1', 1), ('A2', 3), ('A1', 1) tab(a, b);",
        result: 'A1 1   1\n A1 1   2\n A1 2   3\n A2 3   1',
      },
    ],
    name: 'row_number',
  },
  {
    args: ['str', 'len[', ' pad]'],
    description: 'Returns str, right',
    examples: [
      {
        statement: "SELECT rpad('hi', 5, '??');",
        result: 'hi???',
      },
      {
        statement: "SELECT rpad('hi', 1, '??');",
        result: 'h',
      },
      {
        statement: "SELECT rpad('hi', 5);",
        result: 'hi',
      },
      {
        statement: "SELECT hex(rpad(unhex('aabb'), 5));",
        result: 'AABB000000',
      },
      {
        statement: "SELECT hex(rpad(unhex('aabb'), 5, unhex('1122')));",
        result: 'AABB112211',
      },
    ],
    name: 'rpad',
  },
  {
    args: ['str'],
    description: 'Removes the trailing space characters from str.',
    examples: [
      {
        statement: "SELECT rtrim('    SparkSQL   ');",
        result: 'SparkSQL',
      },
    ],
    name: 'rtrim',
  },
  {
    args: ['csv[', 'options]'],
    description: 'Returns schema in the DDL format of CSV string.',
    examples: [
      {
        statement: "SELECT schema_of_csv('1,abc');",
        result: 'STRUCT<_c0: INT, _c1: STRING>',
      },
    ],
    name: 'schema_of_csv',
  },
  {
    args: ['json[', 'options]'],
    description: 'Returns schema in the DDL format of JSON string.',
    examples: [
      {
        statement: 'SELECT schema_of_json(\'[{"col":0}]\');',
        result: 'ARRAY<STRUCT<col: BIGINT>>',
      },
      {
        statement:
          "SELECT schema_of_json('[{\"col\":01}]', map('allowNumericLeadingZeros', 'true'));",
        result: 'ARRAY<STRUCT<col: BIGINT>>',
      },
    ],
    name: 'schema_of_json',
  },
  {
    args: ['expr'],
    description:
      'Returns the secant of expr, as if computed by 1/java.lang.Math.cos.',
    examples: [
      {
        statement: 'SELECT sec(0);',
        result: '1.0',
      },
    ],
    name: 'sec',
  },
  {
    args: ['timestamp'],
    description: 'Returns the second component of the string/timestamp.',
    examples: [
      {
        statement: "SELECT second('2009-07-30 12:58:59');",
        result: '59',
      },
    ],
    name: 'second',
  },
  {
    args: ['str[', 'lang', ' country]'],
    description: 'Splits str into an array of array of words.',
    examples: [
      {
        statement: "SELECT sentences('Hi there! Good morning.');",
        result: '[["Hi","there"],["Good","morning"]]',
      },
    ],
    name: 'sentences',
  },
  {
    args: ['start', 'stop', ' step'],
    description:
      'Generates an array of elements from start to stop (inclusive),\nincrementing by step. The type of the returned elements is the same as the type of argument\nexpressions.',
    examples: [
      {
        statement: 'SELECT sequence(1, 5);',
        result: '[1,2,3,4,5]',
      },
      {
        statement: 'SELECT sequence(5, 1);',
        result: '[5,4,3,2,1]',
      },
      {
        statement:
          "SELECT sequence(to_date('2018-01-01'), to_date('2018-03-01'), interval 1 month);",
        result: '[2018-01-01,2018-02-01,2018-03-01]',
      },
      {
        statement:
          "SELECT sequence(to_date('2018-01-01'), to_date('2018-03-01'), interval '0-1' year to month);",
        result: '[2018-01-01,2018-02-01,2018-03-01]',
      },
    ],
    name: 'sequence',
  },
  {
    args: ['time_column', 'gap_duration'],
    description:
      "Generates session window given a timestamp specifying column and gap duration.\nSee 'Types of time windows' in Structured Streaming guide doc for detailed explanation and examples.",
    examples: [
      {
        statement:
          "SELECT a, session_window.start, session_window.end, count(*) as cnt FROM VALUES ('A1', '2021-01-01 00:00:00'), ('A1', '2021-01-01 00:04:30'), ('A1', '2021-01-01 00:10:00'), ('A2', '2021-01-01 00:01:00') AS tab(a, b) GROUP by a, session_window(b, '5 minutes') ORDER BY a, start;",
        result:
          'A1    2021-01-01 00:00:00 2021-01-01 00:09:30 2\n  A1    2021-01-01 00:10:00 2021-01-01 00:15:00 1\n  A2    2021-01-01 00:01:00 2021-01-01 00:06:00 1',
      },
      {
        statement:
          "SELECT a, session_window.start, session_window.end, count(*) as cnt FROM VALUES ('A1', '2021-01-01 00:00:00'), ('A1', '2021-01-01 00:04:30'), ('A1', '2021-01-01 00:10:00'), ('A2', '2021-01-01 00:01:00'), ('A2', '2021-01-01 00:04:30') AS tab(a, b) GROUP by a, session_window(b, CASE WHEN a = 'A1' THEN '5 minutes' WHEN a = 'A2' THEN '1 minute' ELSE '10 minutes' END) ORDER BY a, start;",
        result:
          'A1    2021-01-01 00:00:00 2021-01-01 00:09:30 2\n  A1    2021-01-01 00:10:00 2021-01-01 00:15:00 1\n  A2    2021-01-01 00:01:00 2021-01-01 00:02:00 1\n  A2    2021-01-01 00:04:30 2021-01-01 00:05:30 1',
      },
    ],
    name: 'session_window',
  },
  {
    args: ['expr'],
    description: 'Returns a sha1 hash value as a hex string of the expr.',
    examples: [
      {
        statement: "SELECT sha('Spark');",
        result: '85f5955f4b27a9a4c2aab6ffe5d7189fc298b92c',
      },
    ],
    name: 'sha',
  },
  {
    args: ['expr'],
    description: 'Returns a sha1 hash value as a hex string of the expr.',
    examples: [
      {
        statement: "SELECT sha1('Spark');",
        result: '85f5955f4b27a9a4c2aab6ffe5d7189fc298b92c',
      },
    ],
    name: 'sha1',
  },
  {
    args: ['expr', 'bitLength'],
    description: 'Returns a checksum of SHA',
    examples: [
      {
        statement: "SELECT sha2('Spark', 256);",
        result:
          '529bc3b07127ecb7e53a4dcf1991d9152c24537d919178022b2c42657f79a26b',
      },
    ],
    name: 'sha2',
  },
  {
    args: ['base', 'expr'],
    description: 'Bitwise left shift.',
    examples: [
      {
        statement: 'SELECT shiftleft(2, 1);',
        result: '4',
      },
    ],
    name: 'shiftleft',
  },
  {
    args: ['base', 'expr'],
    description: 'Bitwise (signed) right shift.',
    examples: [
      {
        statement: 'SELECT shiftright(4, 1);',
        result: '2',
      },
    ],
    name: 'shiftright',
  },
  {
    args: ['base', 'expr'],
    description: 'Bitwise unsigned right shift.',
    examples: [
      {
        statement: 'SELECT shiftrightunsigned(4, 1);',
        result: '2',
      },
    ],
    name: 'shiftrightunsigned',
  },
  {
    args: ['array'],
    description: 'Returns a random permutation of the given array.',
    examples: [
      {
        statement: 'SELECT shuffle(array(1, 20, 3, 5));',
        result: '[3,1,5,20]',
      },
      {
        statement: 'SELECT shuffle(array(1, 20, null, 3));',
        result: '[20,null,3,1]',
      },
    ],
    name: 'shuffle',
  },
  {
    args: ['expr'],
    description: 'Returns',
    examples: [
      {
        statement: 'SELECT sign(40);',
        result: '1.0',
      },
      {
        statement: "SELECT sign(INTERVAL -'100' YEAR);",
        result: '-1.0',
      },
    ],
    name: 'sign',
  },
  {
    args: ['expr'],
    description: 'Returns',
    examples: [
      {
        statement: 'SELECT signum(40);',
        result: '1.0',
      },
      {
        statement: "SELECT signum(INTERVAL -'100' YEAR);",
        result: '-1.0',
      },
    ],
    name: 'signum',
  },
  {
    args: ['expr'],
    description:
      'Returns the sine of expr, as if computed by java.lang.Math.sin.',
    examples: [
      {
        statement: 'SELECT sin(0);',
        result: '0.0',
      },
    ],
    name: 'sin',
  },
  {
    args: ['expr'],
    description:
      'Returns hyperbolic sine of expr, as if computed by java.lang.Math.sinh.',
    examples: [
      {
        statement: 'SELECT sinh(0);',
        result: '0.0',
      },
    ],
    name: 'sinh',
  },
  {
    args: ['expr'],
    description:
      'Returns the size of an array or a map.\nThe function returns null for null input if spark.sql.legacy.sizeOfNull is set to false or\nspark.sql.ansi.enabled is set to true. Otherwise, the function returns',
    examples: [
      {
        statement: "SELECT size(array('b', 'd', 'c', 'a'));",
        result: '4',
      },
      {
        statement: "SELECT size(map('a', 1, 'b', 2));",
        result: '2',
      },
    ],
    name: 'size',
  },
  {
    args: ['expr'],
    description:
      'Returns the skewness value calculated from values of a group.',
    examples: [
      {
        statement:
          'SELECT skewness(col) FROM VALUES (-10), (-20), (100), (1000) AS tab(col);',
        result: '1.1135657469022011',
      },
      {
        statement:
          'SELECT skewness(col) FROM VALUES (-1000), (-100), (10), (20) AS tab(col);',
        result: '-1.1135657469022011',
      },
    ],
    name: 'skewness',
  },
  {
    args: ['x', 'start', ' length'],
    description:
      'Subsets array x starting from index start (array indices start at 1, or starting from the end if start is negative) with the specified length.',
    examples: [
      {
        statement: 'SELECT slice(array(1, 2, 3, 4), 2, 2);',
        result: '[2,3]',
      },
      {
        statement: 'SELECT slice(array(1, 2, 3, 4), -2, 2);',
        result: '[3,4]',
      },
    ],
    name: 'slice',
  },
  {
    args: ['expr'],
    description: 'Returns true if at least one value of expr is true.',
    examples: [
      {
        statement:
          'SELECT some(col) FROM VALUES (true), (false), (false) AS tab(col);',
        result: 'true',
      },
      {
        statement:
          'SELECT some(col) FROM VALUES (NULL), (true), (false) AS tab(col);',
        result: 'true',
      },
      {
        statement:
          'SELECT some(col) FROM VALUES (false), (false), (NULL) AS tab(col);',
        result: 'false',
      },
    ],
    name: 'some',
  },
  {
    args: ['array[', 'ascendingOrder]'],
    description:
      'Sorts the input array in ascending or descending order\naccording to the natural ordering of the array elements. NaN is greater than any non',
    examples: [
      {
        statement: "SELECT sort_array(array('b', 'd', null, 'c', 'a'), true);",
        result: '[null,"a","b","c","d"]',
      },
    ],
    name: 'sort_array',
  },
  {
    args: ['str'],
    description: 'Returns Soundex code of the string.',
    examples: [
      {
        statement: "SELECT soundex('Miller');",
        result: 'M460',
      },
    ],
    name: 'soundex',
  },
  {
    args: ['n'],
    description: 'Returns a string consisting of n spaces.',
    examples: [
      {
        statement: "SELECT concat(space(2), '1');",
        result: '1',
      },
    ],
    name: 'space',
  },
  {
    description: 'Returns the current partition id.',
    examples: [
      {
        statement: 'SELECT spark_partition_id();',
        result: '0',
      },
    ],
    name: 'spark_partition_id',
  },
  {
    args: ['str', 'regex', ' limit'],
    description:
      'Splits str around occurrences that match regex and returns an array with a length of at most limit',
    examples: [
      {
        statement: "SELECT split('oneAtwoBthreeC', '[ABC]');",
        result: '["one","two","three",""]',
      },
      {
        statement: "SELECT split('oneAtwoBthreeC', '[ABC]', -1);",
        result: '["one","two","three",""]',
      },
      {
        statement: "SELECT split('oneAtwoBthreeC', '[ABC]', 2);",
        result: '["one","twoBthreeC"]',
      },
    ],
    name: 'split',
  },
  {
    args: ['str', 'delimiter', ' partNum'],
    description:
      'Splits str by delimiter and return\nrequested part of the split (1',
    examples: [
      {
        statement: "SELECT split_part('11.12.13', '.', 3);",
        result: '13',
      },
    ],
    name: 'split_part',
  },
  {
    args: ['expr'],
    description: 'Returns the square root of expr.',
    examples: [
      {
        statement: 'SELECT sqrt(4);',
        result: '2.0',
      },
    ],
    name: 'sqrt',
  },
  {
    args: ['n', 'expr1', ' ...', ' exprk'],
    description:
      'Separates expr1, ..., exprk into n rows. Uses column names col0, col1, etc. by default unless specified otherwise.',
    examples: [
      {
        statement: 'SELECT stack(2, 1, 2, 3);',
        result: '1  2\n 3  NULL',
      },
    ],
    name: 'stack',
  },
  {
    args: ['left', 'right'],
    description:
      'Returns a boolean. The value is True if left starts with right.\nReturns NULL if either input expression is NULL. Otherwise, returns False.\nBoth left or right must be of STRING or BINARY type.',
    examples: [
      {
        statement: "SELECT startswith('Spark SQL', 'Spark');",
        result: 'true',
      },
      {
        statement: "SELECT startswith('Spark SQL', 'SQL');",
        result: 'false',
      },
      {
        statement: "SELECT startswith('Spark SQL', null);",
        result: 'NULL',
      },
      {
        statement: "SELECT startswith(x'537061726b2053514c', x'537061726b');",
        result: 'true',
      },
      {
        statement: "SELECT startswith(x'537061726b2053514c', x'53514c');",
        result: 'false',
      },
    ],
    name: 'startswith',
  },
  {
    args: ['expr'],
    description:
      'Returns the sample standard deviation calculated from values of a group.',
    examples: [
      {
        statement: 'SELECT std(col) FROM VALUES (1), (2), (3) AS tab(col);',
        result: '1.0',
      },
    ],
    name: 'std',
  },
  {
    args: ['expr'],
    description:
      'Returns the sample standard deviation calculated from values of a group.',
    examples: [
      {
        statement: 'SELECT stddev(col) FROM VALUES (1), (2), (3) AS tab(col);',
        result: '1.0',
      },
    ],
    name: 'stddev',
  },
  {
    args: ['expr'],
    description:
      'Returns the population standard deviation calculated from values of a group.',
    examples: [
      {
        statement:
          'SELECT stddev_pop(col) FROM VALUES (1), (2), (3) AS tab(col);',
        result: '0.816496580927726',
      },
    ],
    name: 'stddev_pop',
  },
  {
    args: ['expr'],
    description:
      'Returns the sample standard deviation calculated from values of a group.',
    examples: [
      {
        statement:
          'SELECT stddev_samp(col) FROM VALUES (1), (2), (3) AS tab(col);',
        result: '1.0',
      },
    ],
    name: 'stddev_samp',
  },
  {
    args: ['text[', 'pairDelim[', ' keyValueDelim]]'],
    description:
      "Creates a map after splitting the text into key/value pairs using delimiters. Default delimiters are ',' for pairDelim and ':' for keyValueDelim. Both pairDelim and keyValueDelim are treated as regular expressions.",
    examples: [
      {
        statement: "SELECT str_to_map('a:1,b:2,c:3', ',', ':');",
        result: '{"a":"1","b":"2","c":"3"}',
      },
      {
        statement: "SELECT str_to_map('a');",
        result: '{"a":null}',
      },
    ],
    name: 'str_to_map',
  },
  {
    args: ['col1', 'col2', ' col3', ' ...'],
    description: 'Creates a struct with the given field values.',
    examples: [
      {
        statement: 'SELECT struct(1, 2, 3);',
        result: '{"col1":1,"col2":2,"col3":3}',
      },
    ],
    name: 'struct',
  },
  {
    args: ['str', 'pos[', ' len]'],
    description:
      'Returns the substring of str that starts at pos and is of length len, or the slice of byte array that starts at pos and is of length len.',
    examples: [
      {
        statement: "SELECT substr('Spark SQL', 5);",
        result: 'k SQL',
      },
      {
        statement: "SELECT substr('Spark SQL', -3);",
        result: 'SQL',
      },
      {
        statement: "SELECT substr('Spark SQL', 5, 1);",
        result: 'k',
      },
      {
        statement: "SELECT substr('Spark SQL' FROM 5);",
        result: 'k SQL',
      },
      {
        statement: "SELECT substr('Spark SQL' FROM -3);",
        result: 'SQL',
      },
      {
        statement: "SELECT substr('Spark SQL' FROM 5 FOR 1);",
        result: 'k',
      },
    ],
    name: 'substr',
  },
  {
    args: ['str', 'pos[', ' len]'],
    description:
      'Returns the substring of str that starts at pos and is of length len, or the slice of byte array that starts at pos and is of length len.',
    examples: [
      {
        statement: "SELECT substring('Spark SQL', 5);",
        result: 'k SQL',
      },
      {
        statement: "SELECT substring('Spark SQL', -3);",
        result: 'SQL',
      },
      {
        statement: "SELECT substring('Spark SQL', 5, 1);",
        result: 'k',
      },
      {
        statement: "SELECT substring('Spark SQL' FROM 5);",
        result: 'k SQL',
      },
      {
        statement: "SELECT substring('Spark SQL' FROM -3);",
        result: 'SQL',
      },
      {
        statement: "SELECT substring('Spark SQL' FROM 5 FOR 1);",
        result: 'k',
      },
    ],
    name: 'substring',
  },
  {
    args: ['str', 'delim', ' count'],
    description:
      'Returns the substring from str before count occurrences of the delimiter delim.\nIf count is positive, everything to the left of the final delimiter (counting from the\nleft) is returned. If count is negative, everything to the right of the final delimiter\n(counting from the right) is returned. The function substring_index performs a case',
    examples: [
      {
        statement: "SELECT substring_index('www.apache.org', '.', 2);",
        result: 'www.apache',
      },
    ],
    name: 'substring_index',
  },
  {
    args: ['expr'],
    description: 'Returns the sum calculated from values of a group.',
    examples: [
      {
        statement: 'SELECT sum(col) FROM VALUES (5), (10), (15) AS tab(col);',
        result: '30',
      },
      {
        statement:
          'SELECT sum(col) FROM VALUES (NULL), (10), (15) AS tab(col);',
        result: '25',
      },
      {
        statement: 'SELECT sum(col) FROM VALUES (NULL), (NULL) AS tab(col);',
        result: 'NULL',
      },
    ],
    name: 'sum',
  },
  {
    args: ['expr'],
    description:
      'Returns the tangent of expr, as if computed by java.lang.Math.tan.',
    examples: [
      {
        statement: 'SELECT tan(0);',
        result: '0.0',
      },
    ],
    name: 'tan',
  },
  {
    args: ['expr'],
    description:
      'Returns the hyperbolic tangent of expr, as if computed by\njava.lang.Math.tanh.',
    examples: [
      {
        statement: 'SELECT tanh(0);',
        result: '0.0',
      },
    ],
    name: 'tanh',
  },
  {
    args: ['microseconds'],
    description:
      'Creates timestamp from the number of microseconds since UTC epoch.',
    examples: [
      {
        statement: 'SELECT timestamp_micros(1230219000123123);',
        result: '2008-12-25 07:30:00.123123',
      },
    ],
    name: 'timestamp_micros',
  },
  {
    args: ['milliseconds'],
    description:
      'Creates timestamp from the number of milliseconds since UTC epoch.',
    examples: [
      {
        statement: 'SELECT timestamp_millis(1230219000123);',
        result: '2008-12-25 07:30:00.123',
      },
    ],
    name: 'timestamp_millis',
  },
  {
    args: ['seconds'],
    description:
      'Creates timestamp from the number of seconds (can be fractional) since UTC epoch.',
    examples: [
      {
        statement: 'SELECT timestamp_seconds(1230219000);',
        result: '2008-12-25 07:30:00',
      },
      {
        statement: 'SELECT timestamp_seconds(1230219000.123);',
        result: '2008-12-25 07:30:00.123',
      },
    ],
    name: 'timestamp_seconds',
  },
  {
    args: ['str[', 'fmt]'],
    description:
      'Converts the input str to a binary value based on the supplied fmt.\nfmt can be a case',
    examples: [
      {
        statement: "SELECT to_binary('abc', 'utf-8');",
        result: 'abc',
      },
    ],
    name: 'to_binary',
  },
  {
    args: ['expr[', 'options]'],
    description: 'Returns a CSV string with a given struct value',
    examples: [
      {
        statement: "SELECT to_csv(named_struct('a', 1, 'b', 2));",
        result: '1,2',
      },
      {
        statement:
          "SELECT to_csv(named_struct('time', to_timestamp('2015-08-26', 'yyyy-MM-dd')), map('timestampFormat', 'dd/MM/yyyy'));",
        result: '26/08/2015',
      },
    ],
    name: 'to_csv',
  },
  {
    args: ['date_str[', 'fmt]'],
    description:
      'Parses the date_str expression with the fmt expression to\na date. Returns null with invalid input. By default, it follows casting rules to a date if\nthe fmt is omitted.',
    examples: [
      {
        statement: "SELECT to_date('2009-07-30 04:17:52');",
        result: '2009-07-30',
      },
      {
        statement: "SELECT to_date('2016-12-31', 'yyyy-MM-dd');",
        result: '2016-12-31',
      },
    ],
    name: 'to_date',
  },
  {
    args: ['expr[', 'options]'],
    description: 'Returns a JSON string with a given struct value',
    examples: [
      {
        statement: "SELECT to_json(named_struct('a', 1, 'b', 2));",
        result: '{"a":1,"b":2}',
      },
      {
        statement:
          "SELECT to_json(named_struct('time', to_timestamp('2015-08-26', 'yyyy-MM-dd')), map('timestampFormat', 'dd/MM/yyyy'));",
        result: '{"time":"26/08/2015"}',
      },
      {
        statement: "SELECT to_json(array(named_struct('a', 1, 'b', 2)));",
        result: '[{"a":1,"b":2}]',
      },
      {
        statement: "SELECT to_json(map('a', named_struct('b', 1)));",
        result: '{"a":{"b":1}}',
      },
      {
        statement:
          "SELECT to_json(map(named_struct('a', 1),named_struct('b', 2)));",
        result: '{"[1]":{"b":2}}',
      },
      {
        statement: "SELECT to_json(map('a', 1));",
        result: '{"a":1}',
      },
      {
        statement: "SELECT to_json(array((map('a', 1))));",
        result: '[{"a":1}]',
      },
    ],
    name: 'to_json',
  },
  {
    args: ['expr', 'fmt'],
    description:
      "Convert string 'expr' to a number based on the string format 'fmt'.\nThrows an exception if the conversion fails. The format can consist of the following\ncharacters, case insensitive:\n'0' or '9': Specifies an expected digit between 0 and 9. A sequence of 0 or 9 in the format\nstring matches a sequence of digits in the input string. If the 0/9 sequence starts with\n0 and is before the decimal point, it can only match a digit sequence of the same size.\nOtherwise, if the sequence starts with 9 or is after the decimal poin, it can match a\ndigit sequence that has the same or smaller size.\n'.' or 'D': Specifies the position of the decimal point (optional, only allowed once).\n',' or 'G': Specifies the position of the grouping (thousands) separator (,). There must be\none or more 0 or 9 to the left of the rightmost grouping separator. 'expr' must match the\ngrouping separator relevant for the size of the number.\n'$': Specifies the location of the $ currency sign. This character may only be specified\nonce.\n'S' or 'MI': Specifies the position of a '",
    examples: [
      {
        statement: "SELECT to_number('454', '999');",
        result: '454',
      },
      {
        statement: "SELECT to_number('454.00', '000.00');",
        result: '454.00',
      },
      {
        statement: "SELECT to_number('12,454', '99,999');",
        result: '12454',
      },
      {
        statement: "SELECT to_number('$78.12', '$99.99');",
        result: '78.12',
      },
      {
        statement: "SELECT to_number('12,454.8-', '99,999.9S');",
        result: '-12454.8',
      },
    ],
    name: 'to_number',
  },
  {
    args: ['timestamp_str[', 'fmt]'],
    description:
      'Parses the timestamp_str expression with the fmt expression\nto a timestamp. Returns null with invalid input. By default, it follows casting rules to\na timestamp if the fmt is omitted. The result data type is consistent with the value of\nconfiguration spark.sql.timestampType.',
    examples: [
      {
        statement: "SELECT to_timestamp('2016-12-31 00:12:00');",
        result: '2016-12-31 00:12:00',
      },
      {
        statement: "SELECT to_timestamp('2016-12-31', 'yyyy-MM-dd');",
        result: '2016-12-31 00:00:00',
      },
    ],
    name: 'to_timestamp',
  },
  {
    args: ['timeExp[', 'fmt]'],
    description: 'Returns the UNIX timestamp of the given time.',
    examples: [
      {
        statement: "SELECT to_unix_timestamp('2016-04-08', 'yyyy-MM-dd');",
        result: '1460098800',
      },
    ],
    name: 'to_unix_timestamp',
  },
  {
    args: ['timestamp', 'timezone'],
    description: "Given a timestamp like '2017",
    examples: [
      {
        statement: "SELECT to_utc_timestamp('2016-08-31', 'Asia/Seoul');",
        result: '2016-08-30 15:00:00',
      },
    ],
    name: 'to_utc_timestamp',
  },
  {
    args: ['expr', 'func'],
    description: 'Transforms elements in an array using the function.',
    examples: [
      {
        statement: 'SELECT transform(array(1, 2, 3), x -> x + 1);',
        result: '[2,3,4]',
      },
      {
        statement: 'SELECT transform(array(1, 2, 3), (x, i) -> x + i);',
        result: '[1,3,5]',
      },
    ],
    name: 'transform',
  },
  {
    args: ['expr', 'func'],
    description: 'Transforms elements in a map using the function.',
    examples: [
      {
        statement:
          'SELECT transform_keys(map_from_arrays(array(1, 2, 3), array(1, 2, 3)), (k, v) -> k + 1);',
        result: '{2:1,3:2,4:3}',
      },
      {
        statement:
          'SELECT transform_keys(map_from_arrays(array(1, 2, 3), array(1, 2, 3)), (k, v) -> k + v);',
        result: '{2:1,4:2,6:3}',
      },
    ],
    name: 'transform_keys',
  },
  {
    args: ['expr', 'func'],
    description: 'Transforms values in the map using the function.',
    examples: [
      {
        statement:
          'SELECT transform_values(map_from_arrays(array(1, 2, 3), array(1, 2, 3)), (k, v) -> v + 1);',
        result: '{1:2,2:3,3:4}',
      },
      {
        statement:
          'SELECT transform_values(map_from_arrays(array(1, 2, 3), array(1, 2, 3)), (k, v) -> k + v);',
        result: '{1:2,2:4,3:6}',
      },
    ],
    name: 'transform_values',
  },
  {
    args: ['input', 'from', ' to'],
    description:
      'Translates the input string by replacing the characters present in the from string with the corresponding characters in the to string.',
    examples: [
      {
        statement: "SELECT translate('AaBbCc', 'abc', '123');",
        result: 'A1B2C3',
      },
    ],
    name: 'translate',
  },
  {
    args: ['str'],
    description: 'Removes the leading and trailing space characters from str.',
    examples: [
      {
        statement: "SELECT trim('    SparkSQL   ');",
        result: 'SparkSQL',
      },
      {
        statement: "SELECT trim(BOTH FROM '    SparkSQL   ');",
        result: 'SparkSQL',
      },
      {
        statement: "SELECT trim(LEADING FROM '    SparkSQL   ');",
        result: 'SparkSQL',
      },
      {
        statement: "SELECT trim(TRAILING FROM '    SparkSQL   ');",
        result: 'SparkSQL',
      },
      {
        statement: "SELECT trim('SL' FROM 'SSparkSQLS');",
        result: 'parkSQ',
      },
      {
        statement: "SELECT trim(BOTH 'SL' FROM 'SSparkSQLS');",
        result: 'parkSQ',
      },
      {
        statement: "SELECT trim(LEADING 'SL' FROM 'SSparkSQLS');",
        result: 'parkSQLS',
      },
      {
        statement: "SELECT trim(TRAILING 'SL' FROM 'SSparkSQLS');",
        result: 'SSparkSQ',
      },
    ],
    name: 'trim',
  },
  {
    args: ['date', 'fmt'],
    description:
      'Returns date with the time portion of the day truncated to the unit specified by the format model fmt.',
    examples: [
      {
        statement: "SELECT trunc('2019-08-04', 'week');",
        result: '2019-07-29',
      },
      {
        statement: "SELECT trunc('2019-08-04', 'quarter');",
        result: '2019-07-01',
      },
      {
        statement: "SELECT trunc('2009-02-12', 'MM');",
        result: '2009-02-01',
      },
      {
        statement: "SELECT trunc('2015-10-27', 'YEAR');",
        result: '2015-01-01',
      },
    ],
    name: 'trunc',
  },
  {
    args: ['expr1', 'expr2'],
    description:
      'Returns the sum of expr1and expr2 and the result is null on overflow. The acceptable input types are the same with the + operator.',
    examples: [
      {
        statement: 'SELECT try_add(1, 2);',
        result: '3',
      },
      {
        statement: 'SELECT try_add(2147483647, 1);',
        result: 'NULL',
      },
      {
        statement: "SELECT try_add(date'2021-01-01', 1);",
        result: '2021-01-02',
      },
      {
        statement: "SELECT try_add(date'2021-01-01', interval 1 year);",
        result: '2022-01-01',
      },
      {
        statement:
          "SELECT try_add(timestamp'2021-01-01 00:00:00', interval 1 day);",
        result: '2021-01-02 00:00:00',
      },
      {
        statement: 'SELECT try_add(interval 1 year, interval 2 year);',
        result: '3-0',
      },
    ],
    name: 'try_add',
  },
  {
    args: ['expr'],
    description:
      'Returns the mean calculated from values of a group and the result is null on overflow.',
    examples: [
      {
        statement: 'SELECT try_avg(col) FROM VALUES (1), (2), (3) AS tab(col);',
        result: '2.0',
      },
      {
        statement:
          'SELECT try_avg(col) FROM VALUES (1), (2), (NULL) AS tab(col);',
        result: '1.5',
      },
      {
        statement:
          "SELECT try_avg(col) FROM VALUES (interval '2147483647 months'), (interval '1 months') AS tab(col);",
        result: 'NULL',
      },
    ],
    name: 'try_avg',
  },
  {
    args: ['dividend', 'divisor'],
    description:
      'Returns dividend/divisor. It always performs floating point division. Its result is always null if expr2 is 0. dividend must be a numeric or an interval. divisor must be a numeric.',
    examples: [
      {
        statement: 'SELECT try_divide(3, 2);',
        result: '1.5',
      },
      {
        statement: 'SELECT try_divide(2L, 2L);',
        result: '1.0',
      },
      {
        statement: 'SELECT try_divide(1, 0);',
        result: 'NULL',
      },
      {
        statement: 'SELECT try_divide(interval 2 month, 2);',
        result: '0-1',
      },
      {
        statement: 'SELECT try_divide(interval 2 month, 0);',
        result: 'NULL',
      },
    ],
    name: 'try_divide',
  },
  {
    args: ['array', 'index'],
    description: 'Returns element of array at given (1',
    examples: [
      {
        statement: 'SELECT try_element_at(array(1, 2, 3), 2);',
        result: '2',
      },
      {
        statement: "SELECT try_element_at(map(1, 'a', 2, 'b'), 2);",
        result: 'b',
      },
    ],
    name: 'try_element_at',
  },
  {
    args: ['expr1', 'expr2'],
    description:
      'Returns expr1*expr2 and the result is null on overflow. The acceptable input types are the same with the * operator.',
    examples: [
      {
        statement: 'SELECT try_multiply(2, 3);',
        result: '6',
      },
      {
        statement: 'SELECT try_multiply(-2147483648, 10);',
        result: 'NULL',
      },
      {
        statement: 'SELECT try_multiply(interval 2 year, 3);',
        result: '6-0',
      },
    ],
    name: 'try_multiply',
  },
  {
    args: ['expr1', 'expr2'],
    description: 'Returns expr1',
    examples: [
      {
        statement: 'SELECT try_subtract(2, 1);',
        result: '1',
      },
      {
        statement: 'SELECT try_subtract(-2147483648, 1);',
        result: 'NULL',
      },
      {
        statement: "SELECT try_subtract(date'2021-01-02', 1);",
        result: '2021-01-01',
      },
      {
        statement: "SELECT try_subtract(date'2021-01-01', interval 1 year);",
        result: '2020-01-01',
      },
      {
        statement:
          "SELECT try_subtract(timestamp'2021-01-02 00:00:00', interval 1 day);",
        result: '2021-01-01 00:00:00',
      },
      {
        statement: 'SELECT try_subtract(interval 2 year, interval 1 year);',
        result: '1-0',
      },
    ],
    name: 'try_subtract',
  },
  {
    args: ['expr'],
    description:
      'Returns the sum calculated from values of a group and the result is null on overflow.',
    examples: [
      {
        statement:
          'SELECT try_sum(col) FROM VALUES (5), (10), (15) AS tab(col);',
        result: '30',
      },
      {
        statement:
          'SELECT try_sum(col) FROM VALUES (NULL), (10), (15) AS tab(col);',
        result: '25',
      },
      {
        statement:
          'SELECT try_sum(col) FROM VALUES (NULL), (NULL) AS tab(col);',
        result: 'NULL',
      },
      {
        statement:
          'SELECT try_sum(col) FROM VALUES (9223372036854775807L), (1L) AS tab(col);',
        result: 'NULL',
      },
    ],
    name: 'try_sum',
  },
  {
    args: ['str[', 'fmt]'],
    description:
      'This is a special version of to_binary that performs the same operation, but returns a NULL value instead of raising an error if the conversion cannot be performed.',
    examples: [
      {
        statement: "SELECT try_to_binary('abc', 'utf-8');",
        result: 'abc',
      },
      {
        statement: "select try_to_binary('a!', 'base64');",
        result: 'NULL',
      },
      {
        statement: "select try_to_binary('abc', 'invalidFormat');",
        result: 'NULL',
      },
    ],
    name: 'try_to_binary',
  },
  {
    args: ['expr', 'fmt'],
    description:
      "Convert string 'expr' to a number based on the string format fmt.\nReturns NULL if the string 'expr' does not match the expected format. The format follows the\nsame semantics as the to_number function.",
    examples: [
      {
        statement: "SELECT try_to_number('454', '999');",
        result: '454',
      },
      {
        statement: "SELECT try_to_number('454.00', '000.00');",
        result: '454.00',
      },
      {
        statement: "SELECT try_to_number('12,454', '99,999');",
        result: '12454',
      },
      {
        statement: "SELECT try_to_number('$78.12', '$99.99');",
        result: '78.12',
      },
      {
        statement: "SELECT try_to_number('12,454.8-', '99,999.9S');",
        result: '-12454.8',
      },
    ],
    name: 'try_to_number',
  },
  {
    args: ['expr'],
    description: 'Return DDL',
    examples: [
      {
        statement: 'SELECT typeof(1);',
        result: 'int',
      },
      {
        statement: 'SELECT typeof(array(1));',
        result: 'array<int>',
      },
    ],
    name: 'typeof',
  },
  {
    args: ['str'],
    description: 'Returns str with all characters changed to uppercase.',
    examples: [
      {
        statement: "SELECT ucase('SparkSql');",
        result: 'SPARKSQL',
      },
    ],
    name: 'ucase',
  },
  {
    args: ['str'],
    description: 'Converts the argument from a base 64 string str to a binary.',
    examples: [
      {
        statement: "SELECT unbase64('U3BhcmsgU1FM');",
        result: 'Spark SQL',
      },
    ],
    name: 'unbase64',
  },
  {
    args: ['expr'],
    description: 'Converts hexadecimal expr to binary.',
    examples: [
      {
        statement: "SELECT decode(unhex('537061726B2053514C'), 'UTF-8');",
        result: 'Spark SQL',
      },
    ],
    name: 'unhex',
  },
  {
    args: ['date'],
    description: 'Returns the number of days since 1970',
    examples: [
      {
        statement: 'SELECT unix_date(DATE("1970-01-02"));',
        result: '1',
      },
    ],
    name: 'unix_date',
  },
  {
    args: ['timestamp'],
    description: 'Returns the number of microseconds since 1970',
    examples: [
      {
        statement: "SELECT unix_micros(TIMESTAMP('1970-01-01 00:00:01Z'));",
        result: '1000000',
      },
    ],
    name: 'unix_micros',
  },
  {
    args: ['timestamp'],
    description: 'Returns the number of milliseconds since 1970',
    examples: [
      {
        statement: "SELECT unix_millis(TIMESTAMP('1970-01-01 00:00:01Z'));",
        result: '1000',
      },
    ],
    name: 'unix_millis',
  },
  {
    args: ['timestamp'],
    description: 'Returns the number of seconds since 1970',
    examples: [
      {
        statement: "SELECT unix_seconds(TIMESTAMP('1970-01-01 00:00:01Z'));",
        result: '1',
      },
    ],
    name: 'unix_seconds',
  },
  {
    args: ['[timeExp[', 'fmt]]'],
    description: 'Returns the UNIX timestamp of current or specified time.',
    examples: [
      {
        statement: 'SELECT unix_timestamp();',
        result: '1476884637',
      },
      {
        statement: "SELECT unix_timestamp('2016-04-08', 'yyyy-MM-dd');",
        result: '1460041200',
      },
    ],
    name: 'unix_timestamp',
  },
  {
    args: ['str'],
    description: 'Returns str with all characters changed to uppercase.',
    examples: [
      {
        statement: "SELECT upper('SparkSql');",
        result: 'SPARKSQL',
      },
    ],
    name: 'upper',
  },
  {
    description:
      'Returns an universally unique identifier (UUID) string. The value is returned as a canonical UUID 36',
    examples: [
      {
        statement: 'SELECT uuid();',
        result: '46707d92-02f4-4817-8116-a4c3b23e6266',
      },
    ],
    name: 'uuid',
  },
  {
    args: ['expr'],
    description:
      'Returns the population variance calculated from values of a group.',
    examples: [
      {
        statement: 'SELECT var_pop(col) FROM VALUES (1), (2), (3) AS tab(col);',
        result: '0.6666666666666666',
      },
    ],
    name: 'var_pop',
  },
  {
    args: ['expr'],
    description:
      'Returns the sample variance calculated from values of a group.',
    examples: [
      {
        statement:
          'SELECT var_samp(col) FROM VALUES (1), (2), (3) AS tab(col);',
        result: '1.0',
      },
    ],
    name: 'var_samp',
  },
  {
    args: ['expr'],
    description:
      'Returns the sample variance calculated from values of a group.',
    examples: [
      {
        statement:
          'SELECT variance(col) FROM VALUES (1), (2), (3) AS tab(col);',
        result: '1.0',
      },
    ],
    name: 'variance',
  },
  {
    description:
      'Returns the Spark version. The string contains 2 fields, the first being a release version and the second being a git revision.',
    examples: [
      {
        statement: 'SELECT version();',
        result: '3.1.0 a6d6ea3efedbad14d99c24143834cd4e2e52fb40',
      },
    ],
    name: 'version',
  },
  {
    args: ['date'],
    description:
      'Returns the day of the week for date/timestamp (0 = Monday, 1 = Tuesday, ..., 6 = Sunday).',
    examples: [
      {
        statement: "SELECT weekday('2009-07-30');",
        result: '3',
      },
    ],
    name: 'weekday',
  },
  {
    args: ['date'],
    description:
      'Returns the week of the year of the given date. A week is considered to start on a Monday and week 1 is the first week with >3 days.',
    examples: [
      {
        statement: "SELECT weekofyear('2008-02-20');",
        result: '8',
      },
    ],
    name: 'weekofyear',
  },
  {
    args: ['value', 'min_value', ' max_value', ' num_bucket'],
    description:
      'Returns the bucket number to which\nvalue would be assigned in an equiwidth histogram with num_bucket buckets,\nin the range min_value to max_value."',
    examples: [
      {
        statement: 'SELECT width_bucket(5.3, 0.2, 10.6, 5);',
        result: '3',
      },
      {
        statement: 'SELECT width_bucket(-2.1, 1.3, 3.4, 3);',
        result: '0',
      },
      {
        statement: 'SELECT width_bucket(8.1, 0.0, 5.7, 4);',
        result: '5',
      },
      {
        statement: 'SELECT width_bucket(-0.9, 5.2, 0.5, 2);',
        result: '3',
      },
      {
        statement:
          "SELECT width_bucket(INTERVAL '0' YEAR, INTERVAL '0' YEAR, INTERVAL '10' YEAR, 10);",
        result: '1',
      },
      {
        statement:
          "SELECT width_bucket(INTERVAL '1' YEAR, INTERVAL '0' YEAR, INTERVAL '10' YEAR, 10);",
        result: '2',
      },
      {
        statement:
          "SELECT width_bucket(INTERVAL '0' DAY, INTERVAL '0' DAY, INTERVAL '10' DAY, 10);",
        result: '1',
      },
      {
        statement:
          "SELECT width_bucket(INTERVAL '1' DAY, INTERVAL '0' DAY, INTERVAL '10' DAY, 10);",
        result: '2',
      },
    ],
    name: 'width_bucket',
  },
  {
    args: [
      'time_column',
      'window_duration[',
      ' slide_duration[',
      ' start_time]]',
    ],
    description:
      "Bucketize rows into one or more time windows given a timestamp specifying column.\nWindow starts are inclusive but the window ends are exclusive, e.g. 12:05 will be in the window [12:05,12:10) but not in [12:00,12:05).\nWindows can support microsecond precision. Windows in the order of months are not supported.\nSee 'Window Operations on Event Time' in Structured Streaming guide doc for detailed explanation and examples.",
    examples: [
      {
        statement:
          "SELECT a, window.start, window.end, count(*) as cnt FROM VALUES ('A1', '2021-01-01 00:00:00'), ('A1', '2021-01-01 00:04:30'), ('A1', '2021-01-01 00:06:00'), ('A2', '2021-01-01 00:01:00') AS tab(a, b) GROUP by a, window(b, '5 minutes') ORDER BY a, start;",
        result:
          'A1    2021-01-01 00:00:00 2021-01-01 00:05:00 2\n  A1    2021-01-01 00:05:00 2021-01-01 00:10:00 1\n  A2    2021-01-01 00:00:00 2021-01-01 00:05:00 1',
      },
      {
        statement:
          "SELECT a, window.start, window.end, count(*) as cnt FROM VALUES ('A1', '2021-01-01 00:00:00'), ('A1', '2021-01-01 00:04:30'), ('A1', '2021-01-01 00:06:00'), ('A2', '2021-01-01 00:01:00') AS tab(a, b) GROUP by a, window(b, '10 minutes', '5 minutes') ORDER BY a, start;",
        result:
          'A1    2020-12-31 23:55:00 2021-01-01 00:05:00 2\n  A1    2021-01-01 00:00:00 2021-01-01 00:10:00 3\n  A1    2021-01-01 00:05:00 2021-01-01 00:15:00 1\n  A2    2020-12-31 23:55:00 2021-01-01 00:05:00 1\n  A2    2021-01-01 00:00:00 2021-01-01 00:10:00 1',
      },
    ],
    name: 'window',
  },
  {
    args: ['expr1', 'expr2', ' ...'],
    description: 'Returns a 64',
    examples: [
      {
        statement: "SELECT xxhash64('Spark', array(123), 2);",
        result: '5602566077635097486',
      },
    ],
    name: 'xxhash64',
  },
  {
    args: ['date'],
    description: 'Returns the year component of the date/timestamp.',
    examples: [
      {
        statement: "SELECT year('2016-07-30');",
        result: '2016',
      },
    ],
    name: 'year',
  },
  {
    args: ['left', 'right', ' func'],
    description: 'Merges the two given arrays, element',
    examples: [
      {
        statement:
          "SELECT zip_with(array(1, 2, 3), array('a', 'b', 'c'), (x, y) -> (y, x));",
        result: '[{"y":"a","x":1},{"y":"b","x":2},{"y":"c","x":3}]',
      },
      {
        statement:
          'SELECT zip_with(array(1, 2), array(3, 4), (x, y) -> x + y);',
        result: '[4,6]',
      },
      {
        statement:
          "SELECT zip_with(array('a', 'b', 'c'), array('d', 'e', 'f'), (x, y) -> concat(x, y));",
        result: '["ad","be","cf"]',
      },
    ],
    name: 'zip_with',
  },
];

export const sparkFnDocumentations: SparkFunctionDocumentation[] = [
  ...builtInSparkFnDocumentations.map((item) => ({
    ...item,
    type: SPARK_FUNCTION_TYPE.SPARK,
  })),
  ...customCogniteSparkFnDocumentations.map((item) => ({
    ...item,
    type: SPARK_FUNCTION_TYPE.CUSTOM,
  })),
];
