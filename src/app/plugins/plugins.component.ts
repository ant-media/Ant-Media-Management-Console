import { Component, OnInit } from '@angular/core';
import { RestService } from '../rest/rest.service';

declare var swal: any;

@Component({
    moduleId: module.id,
    selector: 'plugins-cmp',
    templateUrl: 'plugins.component.html',
    styleUrls: ['plugins.component.css']
})
export class PluginsComponent implements OnInit {

    catalogPlugins: any[] = [];
    installedPlugins: any[] = [];
    mergedPlugins: any[] = [];
    customPlugins: any[] = [];
    loading = true;
    installing: { [key: string]: boolean } = {};
    uninstalling: { [key: string]: boolean } = {};

    constructor(private restService: RestService) {}

    ngOnInit() {
        this.loadPlugins();
    }

    loadPlugins() {
        this.loading = true;

        this.restService.getServerSettings().subscribe((settings: any) => {
            let registryUrl = settings.pluginRegistryUrl || 'http://localhost:8888/catalog.json';

            // Use native fetch for the catalog — Angular's HttpClient adds withCredentials
            // via the AuthInterceptor, which breaks CORS for external URLs.
            fetch(registryUrl)
                .then(res => res.json())
                .then((catalog: any) => {
                    this.catalogPlugins = catalog.plugins || [];
                    this.fetchInstalledAndMerge();
                })
                .catch((error) => {
                    console.warn('Could not fetch plugin catalog:', error);
                    this.catalogPlugins = [];
                    this.fetchInstalledAndMerge();
                });
        });
    }

    fetchInstalledAndMerge() {
        this.restService.getInstalledPlugins().subscribe(
            (installed: any) => {
                this.installedPlugins = installed || [];
                this.mergePluginLists();
                this.loading = false;
            },
            (error) => {
                console.warn('Could not fetch installed plugins:', error);
                this.installedPlugins = [];
                this.mergePluginLists();
                this.loading = false;
            }
        );
    }

    mergePluginLists() {
        console.log('Catalog plugins:', JSON.stringify(this.catalogPlugins));
        console.log('Installed plugins:', JSON.stringify(this.installedPlugins));

        let installedMap = new Map<string, any>();
        for (let p of this.installedPlugins) {
            let key = p.pluginId || p.name || '';
            installedMap.set(key, p);
        }

        // Merge catalog plugins with install status
        this.mergedPlugins = this.catalogPlugins.map(entry => {
            // Try to find a matching installed plugin by id or by name
            let installed = installedMap.get(entry.id) || null;

            // Also try matching by plugin name if id didn't match
            if (!installed) {
                for (let [, val] of installedMap) {
                    if (val.name === entry.name) {
                        installed = val;
                        break;
                    }
                }
            }

            // Remove from map so we can find custom plugins later
            if (installed) {
                installedMap.delete(installed.pluginId || installed.name);
            }

            return {
                ...entry,
                installed: !!installed,
                installedRecord: installed,
                state: installed ? installed.state : null
            };
        });

        // Remaining installed plugins not in catalog = custom plugins
        this.customPlugins = [];
        installedMap.forEach((val) => {
            this.customPlugins.push(val);
        });
    }

    getStatusLabel(plugin: any): string {
        if (!plugin.installed) return '';
        switch (plugin.state) {
            case 'ACTIVE': return 'Active';
            case 'INSTALLED_PENDING_RESTART': return 'Restart Required';
            case 'INSTALLING': return 'Installing...';
            case 'FAILED': return 'Failed';
            default: return plugin.state || 'Unknown';
        }
    }

    getStatusClass(plugin: any): string {
        if (!plugin.installed) return '';
        switch (plugin.state) {
            case 'ACTIVE': return 'status-active';
            case 'INSTALLED_PENDING_RESTART': return 'status-pending';
            case 'INSTALLING': return 'status-installing';
            case 'FAILED': return 'status-failed';
            default: return '';
        }
    }

    getCustomStatusLabel(plugin: any): string {
        return this.getStatusLabel({ installed: true, state: plugin.state });
    }

    getCustomStatusClass(plugin: any): string {
        return this.getStatusClass({ installed: true, state: plugin.state });
    }

    installPlugin(plugin: any) {
        let restartNote = plugin.requiresRestart
            ? '<br><br><small style="color:#856404;">⚠️ This plugin requires a server restart after installation.</small>'
            : '';

        swal({
            title: 'Install Plugin',
            html: '<div style="text-align:left; padding: 0 10px;">'
                + '<p style="font-size:16px; margin-bottom:8px;"><strong>' + plugin.name + '</strong></p>'
                + '<p style="color:#999; font-size:13px; margin-bottom:12px;">v' + plugin.pluginVersion + ' by ' + plugin.author + '</p>'
                + '<p style="color:#666; font-size:14px;">' + (plugin.description || '') + '</p>'
                + restartNote
                + '</div>',
            showCancelButton: true,
            confirmButtonColor: '#DD0330',
            confirmButtonText: '<i class="fa fa-download"></i> Install',
            cancelButtonText: 'Cancel',
            confirmButtonClass: 'btn btn-sm',
            cancelButtonClass: 'btn btn-sm btn-default',
            buttonsStyling: true
        }).then(() => {
            this.installing[plugin.id] = true;
            this.restService.installPluginFromUrl(plugin.id, plugin.downloadUrl).subscribe(
                (result: any) => {
                    this.installing[plugin.id] = false;
                    if (result.success) {
                        swal({
                            title: 'Installed',
                            text: result.message || 'Plugin installed successfully',
                            type: 'success',
                            confirmButtonColor: '#DD0330'
                        });
                    } else {
                        swal({
                            title: 'Installation Failed',
                            text: result.message || 'Something went wrong',
                            type: 'error',
                            confirmButtonColor: '#DD0330'
                        });
                    }
                    this.loadPlugins();
                },
                (error) => {
                    this.installing[plugin.id] = false;
                    swal({
                        title: 'Installation Failed',
                        text: error.message || 'Could not connect to server',
                        type: 'error',
                        confirmButtonColor: '#DD0330'
                    });
                }
            );
        });
    }

    uninstallPlugin(plugin: any) {
        let name = plugin.name || plugin.pluginId || plugin.id;
        let installedRecord = plugin.installedRecord || plugin;
        let pluginId = installedRecord.pluginId || plugin.id;

        swal({
            title: 'Uninstall Plugin',
            html: '<div style="text-align:left; padding: 0 10px;">'
                + '<p style="font-size:14px;">Are you sure you want to uninstall <strong>' + name + '</strong>?</p>'
                + '<p style="color:#999; font-size:13px;">The plugin files will be removed. A server restart may be needed to fully clean up.</p>'
                + '</div>',
            showCancelButton: true,
            confirmButtonColor: '#DD0330',
            confirmButtonText: '<i class="fa fa-trash-o"></i> Uninstall',
            cancelButtonText: 'Cancel',
            buttonsStyling: true
        }).then(() => {
            this.uninstalling[pluginId] = true;
            this.restService.uninstallPlugin(pluginId).subscribe(
                (result: any) => {
                    this.uninstalling[pluginId] = false;
                    if (result.success) {
                        swal({
                            title: 'Uninstalled',
                            text: result.message || 'Plugin removed',
                            type: 'success',
                            confirmButtonColor: '#DD0330'
                        });
                    } else {
                        swal({
                            title: 'Uninstall Failed',
                            text: result.message || 'Something went wrong',
                            type: 'error',
                            confirmButtonColor: '#DD0330'
                        });
                    }
                    this.loadPlugins();
                },
                (error) => {
                    this.uninstalling[pluginId] = false;
                    swal({
                        title: 'Uninstall Failed',
                        text: error.message || 'Could not connect to server',
                        type: 'error',
                        confirmButtonColor: '#DD0330'
                    });
                }
            );
        });
    }

    uninstallCustomPlugin(plugin: any) {
        this.uninstallPlugin(plugin);
    }

}
