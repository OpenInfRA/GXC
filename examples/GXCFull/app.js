/*
    This file is generated and updated by Sencha Cmd. You can edit this file as
    needed for your application, but these edits will have to be merged by
    Sencha Cmd when upgrading.
*/

//<debug>
Ext.Loader.setConfig({
    enabled: true,
    disableCaching: true
});
Ext.syncRequire([
    'Deft.mixin.Injectable',
    'Deft.mixin.Controllable'
]);
// Show long stack traces when in debug
Q.longStackSupport = true;
//</debug>

Ext.application({
    name: 'GXCFull',
    extend: 'GXC.App'
});
