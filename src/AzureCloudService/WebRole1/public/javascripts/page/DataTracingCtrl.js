/**
 * @namespace SP.Dataset
 * @using SP.String
 * @using SP.Polyfill
*/
(function (exports) {

    var NetWorkRender = (function () {
        function _extractSubDict(nodes) {
            var dict = {};
            nodes.forEach(function (n) {
                if (n.kind === 'sub') dict[n.name] = n;
            });
            return dict;
        }

        function _extractId2Dict(nodes) {
            var dict = {};
            nodes.forEach(function (n) {
                if (dict[n.id] != null) console.log('duplicate id: ' + n.id + +', ' + JSON.stringify(n));
                dict[n.id] = n;
            });
            return dict;
        }

        function _ctorEdgeKey(e) {
            return e.from + '_' + e.to;
        }

        function _extractFromTo2EdgeDict(edges) {
            var dict = {};
            edges.forEach(function (e) {
                dict[_ctorEdgeKey(e)] = e;
            });
            return dict;
        }

        function _buildLabel(centralNode) {
            // for sub, name is subscription name
            var elapse = ((new Date(Date.parse(centralNode.endTime)) - new Date(Date.parse(centralNode.startTime))) * 1.0 / 1000).toFixed(2);

            var text = centralNode.componentName + "\n"
                + SP.String.utc2Local(centralNode.startTime) + "\n"
                + "Latency = " + elapse + "s";
            return text;
        }

        function NetWorkRender(containerId, abb, full) {
            var nodes = full.nodes;
            var edges = full.edges;
            this._containerId = containerId;
            this._abbreviationNodes = abb.nodes;
            this._abbreviationEdges = abb.edges;
            this._nodes = full.nodes;
            this._edges = full.edges;
            this._subName2SubDict = _extractSubDict(nodes);
            this._id2NodeDict = _extractId2Dict(abb.nodes.concat(full.nodes));
            this._fromTo2EdgeDict = _extractFromTo2EdgeDict(edges);
            this._id2EdgeDict = _extractId2Dict(edges);

            this._network = null;


            this._abbLayout = {
                hierarchical: {
                    levelSeparation: 50,
                    direction: 'LR',
                    sortMethod: 'directed',
                    treeSpacing: 50,
                    nodeSpacing: 10,
                    levelSeparation: 200
                }
            }
            this._subsetLayout = {
                'hierarchical': {
                    'sortMethod': 'directed',
                    //'direction': 'LR'
                }
            };

            window._visRender = this;
            window._visLayout = {
                hierarchical: {
                    levelSeparation: 50,
                    direction: 'LR',
                    sortMethod: 'directed',
                    treeSpacing: 50,
                    nodeSpacing: 10,
                    levelSeparation: 200
                }
            };
            window._stop = false;
        }

        NetWorkRender.prototype.close = function () {
            if (self._network != null) {
                self._network.destroy();
                self._network = null;
            }
        }

        NetWorkRender.prototype.renderAbbreviation = function (onClick, onDoubleClick) {
            var self = this;
            self.close();

            var abbNodes = self._abbreviationNodes;
            var abbEdges = self._abbreviationEdges;

            var nodes = abbNodes.map(function (n) {
                var _n = { id: n.id, data_: n, label: _buildLabel(n) };
                return _n;
            });

            var edges = abbEdges.map(function (e) {
                return { from: e.from, to: e.to, id: e.id, arrows: 'to', data_: e, label: '' + e.elapse + "s", font: { align: 'top' } };
            });

            // create a network
            var container = document.getElementById(self._containerId);
            var network = new vis.Network(container,
                {
                    nodes: new vis.DataSet(nodes),
                    edges: new vis.DataSet(edges)
                },
                {
                    'height': '200px',
                    'width': '100%',
                    'layout': self._abbLayout,
                    nodes: { shape: 'circle' }
                });
            network.on('click', function (params) {
                params.event = { kind: 'abb_click' };
                if (onClick != null) onClick(params, network);
            });
            network.on('doubleClick', function (params) {
                if (onDoubleClick != null) onDoubleClick(params, network);
            });
            network.on('zoom', function (params) {
                console.log('current scale: ' + network.getScale());
                console.log(JSON.stringify(params));
            });

            //network.fit({ nodes: subs });
            self._network = network;
            window._network = network;
            return network;
        }

        NetWorkRender.prototype.buildClusterBySubOpt = function (subNames) {
            //if (isStartUp !== true) network.setData(data);
            // network.cluster(opts);
            var self = this;
            return subNames.map(function (subName) {
                return {
                    joinCondition: function (node) {
                        var nd = node.data_ || {};
                        if (nd.kind === 'pub') return nd.usedBySub === subName;
                        if (nd.kind === 'sub') return nd.name === subName;
                        if (nd.kind != null) console.log('unknown kind: ' + nd.kind);
                    },
                    processProperties: function (cOpts, childNodes, childEdges) {
                        var centralNode = {};
                        for (var i = 0; i < childNodes.length; ++i) {
                            if (childNodes[i].data_.kind === 'sub') centralNode = childNodes[i];
                        }
                        // for sub, name is subscription name
                        centralNode = self._subName2SubDict[centralNode.data_.name];
                        cOpts.label = _buildLabel(centralNode);
                        if ((centralNode.outputs || []).length <= 0) {
                            if (centralNode.errorInMessage === true) {
                                cOpts.color = 'red';
                            }
                        }

                        return cOpts;
                    },
                    clusterNodeProperties: {
                        id: subName,//subname as cluster node id
                        shape: 'circle'
                    },
                    clusterEdgeProperties: {
                        length: 5,
                        arrows: 'to'
                    }
                };
            })
        }

        NetWorkRender.prototype.renderAll = function (clusterAll, onClick, onDoubleClick) {
            var self = this;
            self.close();

            var nodes = self._nodes.map(function (n) {
                var _n = { id: n.id, data_: n };
                if (n.kind === 'pub') {
                    _n.shape = 'circle';
                    if (n.isInput === true) _n.color = 'green';
                } else if (n.kind === 'sub') {
                    _n.label = _buildLabel(n);
                    if ((n.outputs || []).length <= 0) {
                        if (n.errorInMessage === true) {
                            _n.color = 'red';
                        }
                    }
                } else {
                    console.log('unknow kind: ' + n.kind);
                }
                return _n;
            });

            var edges = self._edges.map(function (e) {
                return { from: e.from, to: e.to, id: e.id, arrows: 'to', data_: e };
            });

            // create a network
            var container = document.getElementById(self._containerId);
            var network = new vis.Network(container,
                {
                    nodes: new vis.DataSet(nodes),
                    edges: new vis.DataSet(edges)
                },
                {
                    'height': '200px',
                    'width': '100%',
                    'layout': window._visLayout,
                    nodes: { shape: 'circle' }
                });
            network.on('click', function (params) {
                if (params.nodes.length <= 0 && params.edges.length <= 0) return;
                console.log('click: ' + JSON.stringify(params));
                if (onClick != null) onClick(params, network);
            });
            network.on('doubleClick', function (params) {
                if (params.nodes.length <= 0 && params.edges.length <= 0) return;
                console.log('click: ' + JSON.stringify(params));
                if (onDoubleClick != null) onDoubleClick(params, network);
            });
            network.on('zoom', function (params) {
                console.log('current scale: ' + network.getScale());
                console.log(JSON.stringify(params));
            });

            if (clusterAll === true) {
                var subs = Object.keys(self._subName2SubDict);
                console.log(JSON.stringify(subs));
                var opts = self.buildClusterBySubOpt(subs);
                for (var i = 0; i < opts.length; ++i) {
                    network.cluster(opts[i]);
                }
            }
            //network.fit({ nodes: subs });
            self._network = network;
            window._network = network;
            return network;
        }

        NetWorkRender.prototype.renderSubSet = function (subName, onClick) {
            // render sub, input pub, output pubs
            var self = this;
            self.close();

            var sub = self._subName2SubDict[subName];
            var inputPub = self._id2NodeDict[sub.input];
            var outputPubs = (sub.outputs || []).map(function (o) {
                return self._id2NodeDict[o];
            });
            var ioTables = (sub.tables || []).map(function (o) {
                return self._id2NodeDict[o];
            });

            var nodes = [sub, inputPub].concat(outputPubs).concat(ioTables).map(function (n) {
                var _n = { id: n.id, data_: n };
                if (n.kind === 'pub') {
                    _n.shape = 'circle';
                    _n.color = 'rgb(151, 194, 252)';
                    _n.label = 'pub';
                    if (n.id === sub.input) _n.color = 'rgb(0, 255, 0)';
                    _n.font = { size: 25 }
                } else if (n.kind === 'sub') {
                    //_n.shape = 'circle';
                    _n.label = _buildLabel(n);
                    _n.font = { size: 25 }
                    //_n.size = 30;
                } else if (n.kind === 'table') {
                    _n.shape = 'database';
                    _n.color = 'rgb(255, 255, 0)';
                    //_n.size = 30;
                    _n.label = 'table';
                    _n.shapeProperties = { borderDashes: [5, 5] };
                    _n.font = { size: 25 };
                }
                else {
                    console.log('unknow kind: ' + n.kind);
                }
                return _n;
            });

            var usedEdges = [{ from: sub.input, to: sub.id }];
            (sub.outputs || []).concat(sub.tables || []).forEach(function (t) {
                usedEdges.push({ from: sub.id, to: t });
            })

            var dict = _extractId2Dict(nodes);

            var edges = usedEdges.map(function (k) {
                return self._fromTo2EdgeDict[_ctorEdgeKey(k)];
            }).map(function (e) {
                var ns = [];
                if (dict[e.from].data_.kind === 'pub') ns.push(dict[e.from]);
                if (dict[e.from].data_.kind === 'table') ns.push(dict[e.from]);
                if (dict[e.to].data_.kind === 'pub') ns.push(dict[e.to]);
                if (dict[e.to].data_.kind === 'table') ns.push(dict[e.to]);
                ns.forEach(function (n) { n.edge_ = e.id });

                return { from: e.from, to: e.to, id: e.id, arrows: e.arrows || 'to', data_: e };
            });

            // create a network
            var container = document.getElementById(self._containerId);
            var network = new vis.Network(container,
                {
                    nodes: new vis.DataSet(nodes),
                    edges: new vis.DataSet(edges)
                },
                {
                    'height': '200px',
                    'width': '100%',
                    'layout': self._subsetLayout,
                    nodes: { borderWidth: 2 }
                });
            network.on('click', function (params) {
                if (params.nodes.length <= 0 && params.edges.length <= 0) return;
                params.event = { kind: 'subset_click' };
                if (onClick != null) onClick(params, network);
            });
            network.on('zoom', function (params) {
                console.log('current scale: ' + network.getScale());
                console.log(JSON.stringify(params))
            });

            self._network = network;
            window._network = network;
            return network;
        }

        return NetWorkRender;
    }());

    function _prettyJson(json, space) {
        json = json || '';
        if (json.charAt(0) == '[' || json.charAt(0) == '{') {
            try {
                return JSON.stringify(JSON.parse(json), null, space == null ? 4 : space);
            } catch (e) {
                console.log(e);
            }
        }
        return json;
    }

    function _extractFirstTriple4EverySubject(subjectAndTypes) {
        var dict = {};
        (subjectAndTypes || []).forEach(function (v) {
            var subject = v[0];
            if (dict[subject] == null) dict[subject] = v;
        });
        return SP.Polyfill.values(dict);
    }

    exports.IndexCtrl = function ($scope, $uibModal, $http, $rootScope, $window, $timeout, $interval, $log, $sce) {
        $scope.vm = this;
        var self = this;

        $scope.error = null;
        $scope.query = null;
        $scope.dataKey2TraceIds = null;

        $scope.kinds = null;
        $scope.usedKind = null;

        /*
         * dataset, source, extraction, mapping, conflation, graph
         * {source: true|false|error | nodata}
         */
        $scope.isLoading = false;
        $scope.stageDataDict = {};
        //$scope.componentDict = {}; // id-> {}
        //$scope.edgeDict = {}; // id -> {}
        $scope.displayNode = {};
        $scope.viewItems = null;

        $scope.e2eLatency = null;
        $scope.processLatency = null;
        $scope.render = null;

        function _buildDataSetURL(t, d) {
            return self.urlTemplateDataSetDetails
                .replace('PLACEHOLDER_1', t)
                .replace('PLACEHOLDER_2', d);
        }

        function _buildModelURL(t, m) {
            return self.urlTemplateModel
                .replace('PLACEHOLDER_1', t)
                .replace('PLACEHOLDER_2', m);
        }

        $scope.init = function (objOrStrOrId) {
            var obj = SP.String.getInitData(objOrStrOrId);
            SP.Polyfill.assign(self, obj);
            $scope.query = self.query;
            $scope.kinds = obj.kinds;
            $scope.usedKind = $scope.kinds[0];
        }

        $scope.chooseKind = function (k) {
            $scope.usedKind = k;
        }

        $scope.getStage = function (sg) {
            return $scope.stageDataDict[sg];
        }

        $scope.changeStyle = function (sg) {
            var st = $scope.stageLoadingDict[sg];
            if (st === true) return 'btn-warning';
            if (st === false) return 'btn-success';
            if (st === 'error') return 'btn-danger';
            return '';
        }

        $scope.changeStyle2 = function (sg) {
            var st = $scope.stageLoadingDict[sg];
            if (st === true) return 'dt-warning';
            if (st === false) return 'dt-success';
            if (st === 'error') return 'dt-danger';
            return '';
        }

        $scope.utc2Local = function (s) {
            if (s == null) return 'N/A';
            return SP.String.utc2Local(s);
        }

        $scope.normalizeMessageLevel = function (level) {
            if (level == 'E') return "Error";
            if (level == "W") return "Warning";
            return level;
        }

        $scope.normalizeMessageColor = function (level) {
            if (level == 'E') return "btn-danger";
            if (level == "W") return "btn-warning";
            return "";
        }

        function _NormalizeNodeData(nodes) {
            for (var i = 0; i < nodes.length; ++i) {
                var v = nodes[i];
                if (v.startTime != null) v._startLocal = SP.String.utc2Local(v.startTime);
                if (v.endTime != null) v._endLocal = SP.String.utc2Local(v.endTime);
                if (v.info != null && v.info.crawlTime != null) v.info._crawlTimeLocal = SP.String.utc2Local(v.info.crawlTime);

                var span = (new Date(Date.parse(v.endTime)) - new Date(Date.parse(v.startTime))) * 1.0 / 1000;
                v._duration = '' + span.toFixed(2) + 's';

                if (v.dataset != null) v._url = _buildDataSetURL(v.tenant, v.dataset);
                if (v.modelName != null) v._urlModel = _buildModelURL(v.tenant, v.modelName);
            }
        }

        function _buildBajaPathURL(t) {
            return self.urlTemplateBajaInfo.replace('PLACEHOLDER_1', t);
        }

        $scope.extractUriName = SP.String.extractUriName;
        $scope.countObject = function (obj) {
            return Object.keys(obj || {}).length;
        }

        $scope._onClick2ShowDetails = function (params, network) {
            $scope.$apply(function () {
                if (params.event.kind === 'abb_click') {
                    // click abb node, fake sub info
                    if (params.nodes.length == 1) {
                        var n2 = network.body.data.nodes._data[params.nodes[0]];
                        // fake
                        var n = SP.Polyfill.assign({}, n2.data_);
                        n.kind = 'abb+sub';

                        $scope.displayNode = n;
                        $scope.viewItems = null;
                        return;
                    }
                }
                else if (params.event.kind === 'subset_click') {

                    // click sub
                    if (params.nodes.length == 1) {
                        var n2 = network.body.data.nodes._data[params.nodes[0]];
                        var n = n2.data_;
                        if (n.kind === 'sub') {
                            $scope.displayNode = $scope.render._id2NodeDict[n.id];
                            $scope.viewItems = null;
                            return;
                        }
                    }

                    // click pub or table, find its edge
                    var n;
                    var e;
                    if (params.nodes.length == 1) {
                        var n2 = network.body.data.nodes._data[params.nodes[0]];
                        n = n2.data_;
                        e = network.body.data.edges._data[n2.edge_].data_;
                    } else if (params.edges.length == 1) {
                        // click edge, find its pub/table node
                        var e2 = network.body.data.edges._data[params.edges[0]];
                        e = e2.data_;
                        var f = $scope.render._id2NodeDict[e2.from];
                        if (f.kind === 'pub' || f.kind === 'table') n = f;
                        var t = $scope.render._id2NodeDict[e2.to];
                        if (t.kind === 'pub' || t.kind === 'table') n = t;
                    } else {
                        return;
                    }

                    function null4EmptyArray(array) {
                        if (array == null || array.length <= 0) return null;
                        return array;
                    }
                    $scope.displayNode = {
                        kind: 'node+edge',
                        name: n.name,
                        _url: _buildBajaPathURL(n.name),
                        outputEvent: e.outputEvent,
                        reads: null4EmptyArray(e.reads),
                        writes: null4EmptyArray(e.writes),
                        removes: null4EmptyArray(e.removes),
                        batchInfos: null4EmptyArray(e.batchInfos)
                    };
                    $scope.viewItems = null;

                } else {
                    if (params.nodes.length == 1) {
                        var n = params.nodes[0];
                        $scope.displayNode = $scope.render._id2NodeDict[n];
                    } else if (params.edges.length == 1) {
                        var e = params.edges[0];

                        $scope.displayNode = $scope.render._id2EdgeDict[e];
                    }
                    $scope.viewItems = null;
                }

            })
        }

        $scope._onDoubleClick = function (params, network) {
            // focus cluster, and open it, destory current network
            if (params.nodes.length == 1) {
                var id = params.nodes[0];
                var node = $scope.render._id2NodeDict[id];
                if (node.kind === 'abb') {
                    var newNetwork = $scope.render.renderSubSet(node.subName, $scope._onClick2ShowDetails);
                    var cetralSub = $scope.render._subName2SubDict[node.subName];
                    $scope.$apply(function () {
                        newNetwork.focus(cetralSub.id, { scale: 2.0 * newNetwork.getScale() });
                        $scope.displayNode = $scope.render._id2NodeDict[cetralSub.id];
                        $scope.viewItems = null;
                    })
                } else {
                    console.log(node.kind);
                }
            }
        }

        $scope.goBackViewPort = function () {
            $scope.displayNode = null;
            $scope.render.renderAbbreviation($scope._onClick2ShowDetails, $scope._onDoubleClick);
        }

        $scope.goFullView = function () {
            $scope.displayNode = null;
            $scope.render.renderAll(false, $scope._onClick2ShowDetails, $scope._onDoubleClick);
        }

        $scope.click = function (opts) {
            if ($scope.isLoading) {
                console.log('please wait query complete!');
                return;
            }

            opts = opts || {};

            var q = SP.String.trim(opts.traceId || $scope.query || '');
            var k = opts.kind || $scope.usedKind;

            if (q.length <= 0) {
                return;
            }

            if (opts.isChoosen !== true) {
                $scope.dataKey2TraceIds = null;
            } else {
                $scope.dataKey2TraceIds.traceIds.forEach(function (s, i) { s._selected = (i === opts.index) })
            }

            if ($scope.render != null) $scope.render.close();

            $scope.isLoading = true;
            $scope.stageDataDict = {};
            $scope.error = null;
            $scope.displayNode = null;
            $scope.e2eLatency = null;
            $scope.processLatency = null;

            var payload = {
                'input': q,
                'kind': k,
                'debugNetwork': self.debugNetwork
            };
            payload.traceIdTable = self.traceIdTable;
            payload.traceInfoTable = self.traceInfoTable;

            if (SP.String.isNullOrWhitespace(payload.traceIdTable)) payload.traceIdTable = undefined;
            if (SP.String.isNullOrWhitespace(payload.traceInfoTable)) payload.traceInfoTable = undefined;

            $http({ method: 'POST', url: self.queryUrl, data: payload })
                .then(function (res) {
                    var d = res.data;
                    if (d.error) {
                        $scope.error = d.error;
                    } else if (d.kind === "ExternalId" || d.kind === 'SatoriId') {
                        (d.traceIds || []).forEach(function (s) { s._local = SP.String.utc2Local(s.timestamp) });
                        $scope.dataKey2TraceIds = d;
                    } else if (d.kind === 'no_result') {
                        $scope.error = "No Tracing information";
                    } else {
                        _NormalizeNodeData(d.abbreviation.nodes || []);
                        _NormalizeNodeData(d.full.nodes || []);

                        // $scope.displayNode = $scope.componentDict[d.initialId];
                        $scope.e2eLatency = "" + d.e2eLatency + " s";
                        $scope.processLatency = "" + d.processLatency + " s";

                        $scope.render = new NetWorkRender('streaming-network', d.abbreviation, d.full);
                        $scope.render.renderAbbreviation($scope._onClick2ShowDetails, $scope._onDoubleClick);
                    }

                    $scope.isLoading = false;
                },
                function (res) {
                    $scope.error = res.statusText || "";
                    if ($scope.error.length <= 0) {
                        $scope.error = "Status Code: " + res.status;
                    }
                    $scope.isLoading = false;
                });
        }

        $scope.chooseTraceId = function (traceId, index) {
            var opts = { traceId: traceId, index: index, kind: 'TraceId', isChoosen: true }
            $scope.click(opts);
        }

        $scope.viewEvent = function (json, tag, i) {
            if (typeof json === 'string') {
                var tagStr = null;
                if (tag != null) tagStr = tag + " " + (i + 1);
                $scope.viewItems = [{ json: json, tag: tagStr }];
            }
            else if (Array.isArray(json)) {
                var array = [];
                for (var i = 0; i < json.length; ++i) {
                    var tagStr = null;
                    if (tag != null) tagStr = tag + " " + (i + 1);
                    array.push({ json: json[i], tag: tagStr })
                }
                if (array.length > 0) $scope.viewItems = array;
            }
        }

        $scope.getViewItemStr = function () {
            if ($scope.viewItems == null) return null;
            return $scope.viewItems.map(function (v) { return v.json; }).join("\r\n\r\n");
        }

        $scope.view = function (sg, index) {
            var data = $scope.stageDataDict[sg];
            if (data == null) return;

            var obj = {};
            var ctrl = 'dataTracingViewCtrl';

            if (sg === 'source') {
                obj = {
                    format: 'html',
                    title: "Source HTML",
                    data: data.data.document
                };
            }
            else if (sg === 'dataset') {
                obj = {
                    format: 'json',
                    title: "Data From DataSet [" + data.payloads[index].dataset + "]",
                    data: data.payloads[index].payload.payload
                }
                try {
                    obj.data = JSON.stringify(JSON.parse(obj.data), null, 4);
                } catch (e) {
                    console.log(e);
                }
            }
            else if (sg === 'extraction') {
                obj = {
                    format: 'json',
                    title: "Extraction",
                    data: data.data.payload,
                }
            } else if (sg === 'mapping') {
                obj = {
                    format: 'triple',
                    title: 'Mapping Result',
                    data: (data.payloads[index].payload.triples || []).map(function (t) {
                        return [t.subject, t.predicate, t.object];
                    })
                };
                obj.title = obj.title + ' (Count=' + obj.data.length + ')';

                ctrl = 'dataTracingViewTriplesCtrl'
            }

            var modalO = $uibModal.open({
                templateUrl: 'view.html',
                controller: ctrl,
                size: 'p75',
                resolve: {
                    obj: function () {
                        return obj;
                    }
                }
            });

            modalO.result.then(function (n) { }, function () { });
        }

        $scope.viewStaticData = function (type, data) {
            var obj = {};
            var ctrl = 'dataTracingViewCtrl';
            if (type == 'mappingtypes') {
                obj = {
                    format: 'line',
                    title: "Used Ontology Type(s)",
                    data: data
                };
            } else if (type == 'entitymaps') {
                obj = {
                    format: 'map',
                    title: "Apply Satori Id",
                    data: data
                };
            }

            var modalO = $uibModal.open({
                templateUrl: 'view.html',
                controller: ctrl,
                size: 'p75',
                resolve: {
                    obj: function () {
                        return obj;
                    }
                }
            });

            modalO.result.then(function (n) { }, function () { });
        }

        $scope.viewDynamic = function () {
            var data = {
                table: $scope.displayNode.name,
                keys: $scope.viewItems,
                readDataUrl: self.readDataUrl,
                buildBajaPathURLFunc: _buildBajaPathURL,
            };

            var modalO = $uibModal.open({
                templateUrl: 'viewDynamic.html',
                controller: 'dataTracingViewDynamicCtrl',
                size: 'p75',
                resolve: {
                    obj: function () {
                        return data;
                    }
                }
            });

            modalO.result.then(function (n) { }, function () { });
        }
    }

    exports.ViewCtrl = function ($scope, $uibModalInstance, obj) {
        $scope.vm = this;
        var self = this;

        $scope.init = function () {
            SP.Polyfill.assign(self, obj);
        }

        $scope.ok = function () {
            $uibModalInstance.close(self.name);
        }
    }

    exports.ViewDynamicCtrl = function ($scope, $uibModalInstance, $http, obj) {
        $scope.vm = this;

        $scope.isLoading = false;
        $scope.table = null;
        $scope.query = null;
        $scope.error = null;
        $scope.result = null; // {Table, Query, IsAll, Rows}
        $scope.openList = false;
        $scope.showCount = 10;
        $scope.displayCounts = [1, 5, 10, 15, 20];
        var self = this;

        $scope.init = function () {
            SP.Polyfill.assign(self, obj);
            var keys = obj.keys || [];

            self.keys = (obj.keys || []).map(function (k) {
                var o = { json: k.json }
                if (k.tag != null) o.tag = '(' + k.tag + ')' + o.json;
                return o;
            })
            if (keys.length == 1) {
                $scope.query = self.keys[0].json;
            }
        }

        $scope.focusInput = function () {
            $scope.openList = true;
        }

        $scope.chooseKey = function (i) {
            var data = self.keys[i];
            $scope.query = data.json;
            $scope.openList = false;
        }

        $scope.getData = function () {
            $scope.openList = false;
            if ($scope.isLoading) {
                console.log('please wait query complete!');
                return;
            }

            var table = SP.String.trim(self.table || '');
            var q = SP.String.trim($scope.query || '');
            var count = $scope.showCount;

            if (q.length <= 0) return;

            $scope.openList = false;
            $scope.isLoading = true;
            $scope.error = null;
            $scope.result = null;

            $http({
                method: 'POST', url: self.readDataUrl, data: {
                    'table': table, query: q, count: count
                }
            }).then(function (res) {
                var d = res.data;
                if (d.error || d['Error']) {
                    $scope.error = d.error || d['Error'];
                } else {
                    $scope.result = d;
                    $scope.result._url = self.buildBajaPathURLFunc($scope.result.table);
                }

                $scope.isLoading = false;
            }, function (res) {
                $scope.error = res.statusText || "";
                if ($scope.error.length <= 0) {
                    $scope.error = "Status Code: " + res.status;
                }
                $scope.isLoading = false;
            });
        }

        $scope.clickCount = function (v) {
            $scope.showCount = v;
        }
        $scope.ok = function () {
            $uibModalInstance.close(self.name);
        }
    }

    exports.ViewTriplesCtrl = function ($scope, $uibModalInstance, $http, obj) {
        $scope.vm = this;
        var self = this;

        // for triple data
        this.subjectPrefix = null;
        this.propertyPrefixDict = null;//{'http://xxx':'prefix'}
        this.tripleDataLines = null;

        function _findSubjectPrefix(triples) {
            var shared = SP.String.sharedStart(triples.map(function (s) { return s[0] })) || '';
            var i = shared.lastIndexOf('/');
            var sPrefix = i > 0 ? shared.substr(0, i + 1) : shared;
            return sPrefix;
        }
        function _findPropertyPrefix(triples) {
            var KO = "http://knowledge.microsoft.com/";
            var dict = {};
            triples.map(function (s) { return s[1] }).forEach(function (p) {
                if (p != null && p.startsWith(KO)) {
                    var i = p.indexOf('/', KO.length + 1);
                    if (i > 0) {
                        var prefix = p.substr(KO.length, i - KO.length);
                        dict[KO + prefix + "/"] = prefix;
                    }
                }
            });
            return dict;
        }

        $scope.init = function () {
            SP.Polyfill.assign(self, obj);

            self.tripleDataLines = self.data;
            self.subjectPrefix = _findSubjectPrefix(self.data || []);
            self.propertyPrefixDict = _findPropertyPrefix(self.data || []);
        }

        $scope.shortenSubject = function (prefix, value) {
            return (prefix == null || prefix.length <= 0) ? value : value.substr(prefix.length);
        }

        $scope.shortenProperty = function (dict, p) {
            if (dict == null || p == null) return p;
            for (var k in dict) {
                if (p.startsWith(k)) return dict[k] + ': ' + p.substr(k.length);
            }
            return p;
        }

        $scope.getDictCount = function (d) {
            return Object.keys(d || {}).length;
        }

        $scope.ok = $uibModalInstance.close;
    }
})(SP.DataTracing || (SP.DataTracing = {}));

(function (exports) {
    exports.main = function () {
        SP.App.getSharedApp()
            .controller('dataTracingIndexCtrl', SP.DataTracing.IndexCtrl)
            .controller('dataTracingViewCtrl', SP.DataTracing.ViewCtrl)
            .controller('dataTracingViewDynamicCtrl', SP.DataTracing.ViewDynamicCtrl);
    }
})(SP.DataTracing || (SP.DataTracing = {}));