(function() {

  const hooks = {},
        byType = {};

  class HookRegistry {

    static register(id, hookClass, types) {
      if (!types) throw `Hook ${id} does not define any type`;
      console.log('Registering hook', id);
      hooks[id] = hookClass;
      types.forEach((type) => {
        if (!byType[type]) byType[type] = [];
        byType[type].push(id);
      });
    }

    static resolve(id) {
      return hooks[id];
    }

    static resolveByType(type) {
      return byType[type] || [];
    }

  }

  Heed.HookRegistry = HookRegistry;

})();
