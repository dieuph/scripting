var data = data || { issues: [] };

var stories = data.issues.map((issue, index, issues) => {
    issue.index = index + 1;
    issue.goal = false;
    issue.active = true;
    return issue;
});

var tasks = data.issues.flatMap((issue, index, issues) => {
    return issue.fields.subtasks.map((subtask) => {
        subtask.index = index + 1;
        subtask.parent = issue.key;
        subtask.active = true;
        return subtask;
    });
});

Vue.component('configuration', {
    props: ['application', 'settings', 'design'],
    template:
    `
    <v-navigation-drawer fixed clipped class="print-media">
        <v-toolbar flat dense short>
            {{ application }}
        </v-toolbar>
        <v-divider></v-divider>
        <v-subheader>SETTINGS</v-subheader>
        <v-form class="sub-panel settings">
            <v-layout>
                <v-flex md11>
                    <v-select outlined single-line clearable dense
                        label="Type"
                        :items="settings.types"
                        v-model="settings.type"
                        v-on:change="onChangeType"
                        v-on:click:clear="onClearType">
                    </v-select>
                    <v-text-field outlined single-line clearable dense v-show="isDisplayIncludes()"
                        label="Includes"
                        v-model="settings.includes"
                        v-on:change="onChangeIncludes"
                        v-on:click:clear="onClearIncludes">
                        <template v-slot:append>
                            <v-tooltip bottom>
                                <template v-slot:activator="{on}">
                                    <v-icon v-on="on">mdi-help-circle-outline</v-icon>
                                </template>
                                Fill id, separate by comma.
                            </v-tooltip>
                        </template>
                    </v-text-field>
                    <v-text-field outlined single-line clearable dense
                        label="Excludes"
                        v-model="settings.excludes"
                        v-on:change="onChangeExcludes"
                        v-on:click:clear="onClearExcludes">
                        <template v-slot:append>
                            <v-tooltip bottom>
                                <template v-slot:activator="{on}">
                                    <v-icon v-on="on">mdi-help-circle-outline</v-icon>
                                </template>
                                Fill summary text or id, separate by comma.
                            </v-tooltip>
                        </template>
                    </v-text-field>
                    <v-text-field outlined single-line clearable dense
                        label="Sprint Goal"
                        v-model="settings.goals"
                        v-on:change="onChangeGoals" 
                        v-on:blur="onChangeGoals"
                        v-on:click:clear="onClearGoals">
                        <template v-slot:append>
                            <v-tooltip bottom>
                                <template v-slot:activator="{on}">
                                    <v-icon v-on="on">mdi-help-circle-outline</v-icon>
                                </template>
                                Fill id, separate by comma.
                            </v-tooltip>
                        </template>
                    </v-text-field>
                </v-flex>
            </v-layout>
        </v-form>
        <v-divider></v-divider>
        <v-subheader>CARD DESIGN</v-subheader>
        <v-form class="sub-panel card-design">
            <v-layout>
                <v-flex md11>
                    <v-checkbox label="Ordering" color="primary" v-model="design.ordering"></v-checkbox>
                    <v-checkbox label="Task status" color="primary" v-model="design.status"></v-checkbox>
                    <v-select outlined single-line clearable dense
                        label="Badge Options"
                        v-model="design.badge"
                        :items="['Dots', 'Point']">
                    </v-select>
                </v-flex>
            </v-layout>
        </v-form>
        <v-divider></v-divider>
        <v-btn id="print" class="ma-4" tile color="primary" v-on:click="onClickPrint">
          <v-icon left>mdi-printer</v-icon> Print
        </v-btn>
    </v-navigation-drawer>
    `,
     methods: {
        containsAny(list, text) {
            text = text ? text.trim().toLowerCase() : '';
            let contains = list.filter((value, index) => {
                return text.indexOf(value.trim().toLowerCase()) != -1;
            });
            return contains.length != 0;
        },
        getIssues() {
            if (this.settings.type == undefined || this.settings.type == '') {
                return [];
            }
            if (this.isSubTask()) {
                return tasks;
            }
            if (this.isStory()) {
                return stories;
            }
            if (this.isStandalone()) {
                return [];
            }
            return [];
        },
        isSubTask() {
            return this.settings.type && this.settings.type == 'Sub-Task';
        },
        isStory() {
            return this.settings.type && this.settings.type == 'Story';
        },
        isStandalone() {
            return this.settings.type && this.settings.type == 'Standalone';
        },
        extractToArray(value) {
            if (value == '' || value == null) {
                return [];
            }
            return value.split(",").map((item) => {
                return item.trim();
            }).filter((item) => {
                return item != null;
            }).filter((item) => {
                return item != "";
            });
        },
        getIncludes() {
            return this.extractToArray(this.settings.includes);
        },
        getExcludes() {
            return this.extractToArray(this.settings.excludes);
        },
        getGoals() {
            return this.extractToArray(this.settings.goals);
        },
        isDisplayIncludes() {
            return this.isStandalone();
        },
        isDisplayGoals() {
            return this.isStory();
        },
        onChangeType() {
            vm.issues = this.getIssues();
            this.onChangeExcludes();
        },
        onClearType() {
            this.settings.type = undefined;
            this.settings.excludes = undefined;
            this.settings.goals = undefined;
        },
        onChangeIncludes() {
            let includes = this.getIncludes();
            if (includes.length == 0) {
                this.onClearIncludes();
                return;
            }
            let updatedStories = stories.map((story) => {
                story.active = !this.containsAny(includes, story.key);
                return story;
            });
            let updatedTasks = tasks.map((task) => {
                task.active = !this.containsAny(includes, task.parent);
                return task;
            });
            vm.issues = updatedStories.concat(updatedTasks);
        },
        onClearIncludes() {

        },
        onChangeExcludes() {
            let issues = this.getIssues();
            let excludes = this.getExcludes();
            if (excludes.length == 0) {
                this.onClearExcludes();
                return;
            }
            vm.issues = vm.issues.map((issue) => {
                if (this.isStandalone()) {
                    if (issue.active == true) {
                        issue.active = this.containsAny(excludes, issue.fields.summary);
                    }
                } else {
                    issue.active = !this.containsAny(excludes, issue.fields.summary) && !this.containsAny(excludes, issue.key);
                }
                return issue;
            });
        },
        onClearExcludes() {
            let updatedStories = stories.map((story) => {
                story.active = true;
                return story;
            });
            let updatedTask = tasks.map((task) => {
                task.active = true;
                return task;
            });
            if (this.isStory()) {
                vm.issues = updatedStories;
            } else if (this.isSubTask()) {
                vm.issues = updatedTask;
            } else {
                vm.issues = [];
            }
        },
        onChangeGoals() {
            let goals = this.getGoals();
            if (goals.length == 0) {
                this.onClearGoals();
                return;
            }
            let updatedStories = stories.map((story) => {
                story.goal = this.containsAny(goals, story.fields.summary) || this.containsAny(goals, story.key);
                return story;
            });
            if (this.isStory()) {
                vm.issues = updatedStories;
            }
        },
        onClearGoals() {
            let updatedStories = stories.map((story) => {
                story.goal = false;
                return story;
            });
            if (this.isStory()) {
                vm.issues = updatedStories;
            }
        },
        onClickPrint() {
            window.print()
        }
    }
});

Vue.component('issues', {
    props: ['issues', 'configuration', 'error'],
    template:
    `
    <v-content v-if="error" class="no-padding">
        <v-alert :value="true" type="warning">Something wrong!</v-alert>
    </v-content>
    <v-content v-else class="no-padding">
        <div class="issues" :class="wrapper">
            <issue
                v-for="(issue, index) in issues"
                v-bind:issue="issue"
                v-bind:index="index"
                v-bind:configuration="configuration"
                :key="issue.id">
            </issue>
        </div>
    </v-content>
    `,
    computed: {
        wrapper() {
            return this.issues[0] && this.issues[0].fields.subtasks ? 'issue-rectangle' : 'issue-square';
        }
    }
});

Vue.component('issue', {
    props: ['issue', 'index', 'configuration'],
    template:
    `
    <div v-if="issue.active" class="issue" :class="type">
        <div class="issue-content">
            <div class="issue-header">
                <span v-if="configuration.design.ordering" class="index">{{ issue.index }}</span>
                <span v-if="parent" class="font-weight-bold">{{issue.parent}}</span>
                <span v-if="parent">/</span>
                <span v-bind:class="[parent ? '' : 'font-weight-bold']">{{issue.key}}</span>
            </div>
            <div v-if="task && configuration.design.status" class="issue-status">
                <span class="status">suspended</span>
            </div>
            <div class="issue-summary">
                <div class="summary">{{ issue.fields.summary.length < 100 ? issue.fields.summary : issue.fields.summary.substring(0, 100) + "..." }}</div>
            </div>
            <div v-if="issue.goal" class="issue-goal">
                <img src="https://raw.githack.com/dieuph/scripting/master/jirable/goal.png" />
            </div>
            <div class="issue-footer" v-if="story">
                <span
                    v-if="story && configuration.design.badge =='Point'"
                    class="badge">
                    {{issue.fields.customfield_10002}}
                </span>
                <span
                    v-if="story && configuration.design.badge == 'Dots'"
                    v-for="point in issue.fields.customfield_10002"
                    v-bind:point="point"
                    :key="point"
                    class="badge">
                    {{point}}
                </span>
            </div>
        </div>
    </div>
    `,
    computed: {
        type() {
            return this.$props.issue.fields.issuetype.name != 'Sub-Task' ? 'issue-rectangle' : 'issue-square';
        },
        story() {
            return this.$props.issue.fields.issuetype.name != 'Sub-Task';
        },
        task() {
            return this.$props.issue.fields.issuetype.name == 'Sub-Task';
        },
        parent() {
            return this.$props.issue.parent;
        },
        goal() {
            return this.$props.issue.fields.issuetype.name != 'Sub-Task' && this.$props.issue.goal
        }
    }
});

var vm = new Vue({
    el: '#app',
    vuetify: new Vuetify(),
    data: {
        issues: [],
        configuration: {
            application: 'JIRABLE',
            settings: {
                types: ['Story', 'Sub-Task'],
                type: '',
                excludes: '',
                includes: '',
                goals: ''
            },
            design: {
                ordering: true,
                badge: 'Dots',
                status: true
            }
        },
        error: data.error || false
    }
});
