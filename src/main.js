const PLUGIN_NAME = 'VueNotifications'
const PACKAGE_NAME = 'vue-notifications'
const PROPERTY_NAME = 'notifications'

const TYPE = {
  error: 'error',
  warn: 'warn',
  info: 'info',
  success: 'success'
}

const EVANGELION = 1
const GHOST_IN_THE_SHELL = 2

const MESSAGES = {
  alreadyInstalled: `${PLUGIN_NAME}: plugin already installed`,
  methodNameConflict: `${PLUGIN_NAME}: names conflict - `
}

function getMajorVersion (Vue) {
  const version = Vue.version.match(/(\d+)/g)
  return +version[0]
}

function showInConsole (msg, type, types) {
  if (type === types.error) console.error(msg)
  else if (type === types.warn) console.warn(msg)
  else console.log(msg)
}

function showDefaultMessage ({type, message, title, debugMsg}) {
  let msg = `Title: ${title} Message: ${message} DebugMsg: ${debugMsg} type: ${type}`

  showInConsole(msg, type, TYPE)

  return msg
}

function getValues (vueApp, config) {
  const result = {}
  const keepFnFields = ['cb']

  Object.keys(config).forEach(field => {
    keepFnFields.forEach(fnField => {
      if (field === fnField) {
        result[field] = config[field].bind(vueApp)
      } else {
        result[field] = (typeof config[field] === 'function') ? config[field].call(vueApp) : config[field]
      }
    })
  })

  return result
}

function showMessage (config, options, vueApp) {
  const valuesObj = getValues(vueApp, config)
  const isMethodOverridden = options && options[valuesObj.type]
  const method = isMethodOverridden ? options[valuesObj.type] : showDefaultMessage
  method(valuesObj, vueApp)

  if (config.cb) return config.cb()
}

function addMethods (targetObj, typesObj, options) {
  Object.keys(typesObj).forEach(v => {
    targetObj[typesObj[v]] = function (config) {
      config.type = typesObj[v]
      // TODO (S.Panfilov) fix 'vueApp' in param
      return showMessage(config, options)
    }
  })
}

function setMethod (vueApp, name, options, pluginOptions) {
  if (!options.methods) options.methods = {}

  // ///////////////////////////////////////////////////////////////////////
  // TODO (S.Panfilov) We can't check if method already exist,
  // cause it won't allow us to use same component more then one tine in the same page
  // But it would be good to check somehow if it's already exist a method that was created not from this plugin

  // if (options.methods[name]) {
  // console.error(MESSAGES.methodNameConflict + name)
  // } else {
  //   options.methods[name] = makeMethod(vueApp, name, options, pluginOptions)
  // }

  // ///////////////////////////////////////////////////////////////////////

  if (!options.methods[name]) {
    options.methods[name] = makeMethod(vueApp, name, options, pluginOptions)
  }
}

function makeMethod (vueApp, configName, options, pluginOptions) {
  return function (config) {
    const newConfig = {}
    Object.assign(newConfig, VueNotifications.config)
    Object.assign(newConfig, options[VueNotifications.propertyName][configName])
    Object.assign(newConfig, config)

    return showMessage(newConfig, pluginOptions, vueApp)
  }
}

function initVueNotificationPlugin (vueApp, notifications, pluginOptions) {
  if (!notifications) return
  Object.keys(notifications).forEach(name => {
    setMethod(vueApp, name, vueApp.$options, pluginOptions)
  })

  vueApp.$emit(`${PACKAGE_NAME}-initiated`)
}

function unlinkVueNotificationPlugin (vueApp, notifications) {
  if (!notifications) return
  const attachedMethods = vueApp.$options.methods
  Object.keys(notifications).forEach(name => {
    if (attachedMethods[name]) {
      attachedMethods[name] = undefined
      delete attachedMethods[name]
    }
  })

  vueApp.$emit(`${PACKAGE_NAME}-unlinked`)
}

function makeMixin (Vue, pluginOptions) {
  let hooks = {
    init: '',
    destroy: 'beforeDestroy',
    mounted: ''
  }

  if (getMajorVersion(Vue) === EVANGELION) {
    hooks.init = 'init'
    hooks.mounted = 'compiled'
  }
  if (getMajorVersion(Vue) === GHOST_IN_THE_SHELL) {
    hooks.init = 'beforeCreate'
    hooks.mounted = 'mounted'
  }

  return {
    [hooks.init]: function () {
      const vueApp = this
      const vueAppOptions = this.$options
      const notificationsField = vueAppOptions[VueNotifications.propertyName]

      initVueNotificationPlugin(vueApp, notificationsField, pluginOptions)
    },
    [hooks.destroy]: function () {
      const vueApp = this
      const vueAppOptions = this.$options
      const notificationsField = vueAppOptions[VueNotifications.propertyName]
      unlinkVueNotificationPlugin(vueApp, notificationsField)
    }
  }
}

const VueNotifications = {
  type: TYPE,
  propertyName: PROPERTY_NAME,
  config: {
    type: TYPE.info,
    timeout: 3000
  },
  installed: false,
  /**
   * Plugin | vue-notifications
   * @param  {Function} Vue
   * @param  {Object} pluginOptions
   * @this VueNotifications
   */
  install (Vue, pluginOptions = {}) {
    if (this.installed) throw console.error(MESSAGES.alreadyInstalled)
    const mixin = makeMixin(Vue, pluginOptions)
    Vue.mixin(mixin)

    addMethods(this, this.type, pluginOptions)

    this.installed = true
  }

  //TODO (S.Panfilov) add ability to access this.notifications.someError.message
  //TODO (S.Panfilov) add "noCall:true" property
}

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(VueNotifications)
}

/*START.TESTS_ONLY*/
VueNotifications._private = {}
VueNotifications._private.getMajorVersion = getMajorVersion
VueNotifications._private.showInConsole = showInConsole
VueNotifications._private.showDefaultMessage = showDefaultMessage
VueNotifications._private.getValues = getValues
VueNotifications._private.showMessage = showMessage
VueNotifications._private.addMethods = addMethods
VueNotifications._private.setMethod = setMethod
VueNotifications._private.makeMethod = makeMethod
VueNotifications._private.initVueNotificationPlugin = initVueNotificationPlugin
VueNotifications._private.unlinkVueNotificationPlugin = unlinkVueNotificationPlugin
VueNotifications._private.makeMixin = makeMixin
VueNotifications._private.TYPE = TYPE
VueNotifications._private.PLUGIN_NAME = PLUGIN_NAME
VueNotifications._private.PACKAGE_NAME = PACKAGE_NAME
VueNotifications._private.PROPERTY_NAME = PROPERTY_NAME
VueNotifications._private.EVANGELION = EVANGELION
VueNotifications._private.GHOST_IN_THE_SHELL = GHOST_IN_THE_SHELL
VueNotifications._private.MESSAGES = MESSAGES

export default VueNotifications
/*END.TESTS_ONLY*/
