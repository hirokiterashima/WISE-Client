'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nodeService = require('../../services/nodeService');

var _nodeService2 = _interopRequireDefault(_nodeService);

var _html2canvas = require('html2canvas');

var _html2canvas2 = _interopRequireDefault(_html2canvas);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EmbeddedService = function (_NodeService) {
  _inherits(EmbeddedService, _NodeService);

  function EmbeddedService($filter, $q, StudentAssetService, UtilService) {
    _classCallCheck(this, EmbeddedService);

    var _this = _possibleConstructorReturn(this, (EmbeddedService.__proto__ || Object.getPrototypeOf(EmbeddedService)).call(this));

    _this.$filter = $filter;
    _this.$q = $q;
    _this.StudentAssetService = StudentAssetService;
    _this.UtilService = UtilService;
    _this.$translate = _this.$filter('translate');
    return _this;
  }

  /**
   * Get the component type label
   * example
   * "Embedded"
   */


  _createClass(EmbeddedService, [{
    key: 'getComponentTypeLabel',
    value: function getComponentTypeLabel() {
      return this.$translate('embedded.componentTypeLabel');
    }

    /**
     * Create an Embedded component object
     * @returns a new Embedded component object
     */

  }, {
    key: 'createComponent',
    value: function createComponent() {
      var component = {};
      component.id = this.UtilService.generateKey();
      component.type = 'Embedded';
      component.url = '';
      component.showSaveButton = false;
      component.showSubmitButton = false;
      return component;
    }

    /**
     * Copies an existing Embedded component object
     * @returns a copied Embedded component object
     */

  }, {
    key: 'copyComponent',
    value: function copyComponent(componentToCopy) {
      var component = this.createComponent();
      component.url = componentToCopy.url;
      component.showSaveButton = componentToCopy.showSaveButton;
      component.showSubmitButton = componentToCopy.showSubmitButton;
      return component;
    }

    /**
     * Check if the component was completed
     * @param component the component object
     * @param componentStates the component states for the specific component
     * @param componentEvents the events for the specific component
     * @param nodeEvents the events for the parent node of the component
     * @returns whether the component was completed
     */

  }, {
    key: 'isCompleted',
    value: function isCompleted(component, componentStates, componentEvents, nodeEvents) {
      var result = false;
      var isCompletedFieldInComponentState = false;
      if (componentStates != null) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = componentStates[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var componentState = _step.value;

            if (componentState != null) {
              var studentData = componentState.studentData;
              if (studentData != null) {
                if (studentData.isCompleted != null) {
                  /*
                   * the model has set the isCompleted field in the
                   * student data
                   */
                  isCompletedFieldInComponentState = true;

                  if (studentData.isCompleted === true) {
                    /*
                     * the model has set the isCompleted field to true
                     * which means the student has completed the component
                     */
                    return true;
                  }
                }
              }
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }

      if (isCompletedFieldInComponentState == false) {
        /*
         * the isCompleted field was not set into the component state so
         * we will look for events to determine isCompleted
         */

        if (nodeEvents != null) {
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = nodeEvents[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var event = _step2.value;

              if (event != null && event.event === 'nodeEntered') {
                result = true;
                break;
              }
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        }
      }
      return result;
    }
  }, {
    key: 'componentHasWork',


    /**
     * Whether this component generates student work
     * @param component (optional) the component object. if the component object
     * is not provided, we will use the default value of whether the
     * component type usually has work.
     * @return whether this component generates student work
     */
    value: function componentHasWork(component) {
      return false;
    }

    /**
     * Whether this component uses a save button
     * @return whether this component uses a save button
     */

  }, {
    key: 'componentUsesSaveButton',
    value: function componentUsesSaveButton() {
      return true;
    }

    /**
     * Whether this component uses a submit button
     * @return whether this component uses a submit button
     */

  }, {
    key: 'componentUsesSubmitButton',
    value: function componentUsesSubmitButton() {
      return true;
    }

    /**
     * Check if the component state has student work. Sometimes a component
     * state may be created if the student visits a component but doesn't
     * actually perform any work. This is where we will check if the student
     * actually performed any work.
     * @param componentState the component state object
     * @param componentContent the component content
     * @return whether the component state has any work
     */

  }, {
    key: 'componentStateHasStudentWork',
    value: function componentStateHasStudentWork(componentState, componentContent) {
      if (componentState != null) {
        var studentData = componentState.studentData;
        if (studentData != null) {
          return true;
        }
      }
      return false;
    }

    /**
     * The component state has been rendered in a <component></component> element
     * and now we want to take a snapshot of the work.
     * @param componentState The component state that has been rendered.
     * @return A promise that will return an image object.
     */

  }, {
    key: 'generateImageFromRenderedComponentState',
    value: function generateImageFromRenderedComponentState(componentState) {
      var _this2 = this;

      var deferred = this.$q.defer();
      var iframe = $('#componentApp_' + componentState.componentId);
      if (iframe != null && iframe.length > 0) {
        var modelElement = iframe.contents().find('html');
        if (modelElement != null && modelElement.length > 0) {
          modelElement = modelElement[0];
          // convert the model element to a canvas element
          (0, _html2canvas2.default)(modelElement).then(function (canvas) {
            var img_b64 = canvas.toDataURL('image/png');
            var imageObject = _this2.UtilService.getImageObjectFromBase64String(img_b64);
            // add the image to the student assets
            _this2.StudentAssetService.uploadAsset(imageObject).then(function (asset) {
              deferred.resolve(asset);
            });
          });
        }
      }
      return deferred.promise;
    }
  }]);

  return EmbeddedService;
}(_nodeService2.default);

EmbeddedService.$inject = ['$filter', '$q', 'StudentAssetService', 'UtilService'];

exports.default = EmbeddedService;
//# sourceMappingURL=embeddedService.js.map
