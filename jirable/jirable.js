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
        <v-toolbar flat>
            <v-list>
                <v-list-tile>
                    <v-list-tile-title class="title">
                    {{ application }}
                    </v-list-tile-title>
                </v-list-tile>
            </v-list>
        </v-toolbar>
        <v-divider></v-divider>
        <v-subheader>SETTINGS</v-subheader>
        <v-form class="sub-panel settings">
            <v-layout>
                <v-flex md11>
                    <v-select outline :items="settings.types" label="Type" v-model="settings.type" v-on:change="onChangeType"></v-select>
                    <v-text-field outline label="Excludes" clearable v-model="settings.excludes" v-on:change="onChangeExcludes" v-on:click:clear="onClearExcludes" placeholder="Summary or ID"></v-text-field>
                    <v-text-field outline label="Sprint Goal" clearable v-model="settings.goals" v-on:change="onChangeGoals" v-on:blur="onChangeGoals" v-on:click:clear="onClearGoals" placeholder="ID"></v-text-field>
                </v-flex>
            </v-layout>
        </v-form>
        <v-divider></v-divider>
        <v-subheader>CARD DESIGN</v-subheader>
        <v-form class="sub-panel card-design">
            <v-layout>
                <v-flex md11>
                    <v-checkbox label="Ordering" color="primary" v-model="design.ordering"></v-checkbox>
                    <v-select outline v-model="design.badge" :items="['Dots', 'Point']" label="Badge Options"/>
                    <v-checkbox label="Show status" color="primary" v-model="design.status"></v-checkbox>
                </v-flex>
            </v-layout>
        </v-form>
        <v-divider></v-divider>
    </v-navigation-drawer>
    `,
     methods: {
        containsAny(prohibited, value) {
            return prohibited.every(function(v) {
                return value.indexOf(v) == -1;
            });
        },
        getIssues() {
            if (this.settings.type == '') {
                return [];
            }
            return this.isSubTask() ? tasks : stories;
        },
        isSubTask() {
            let type = this.settings.type;
            return type == 'Sub-Task';
        },
        isStory() {
            return !this.isSubTask();
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
        getExcludes() {
            return this.extractToArray(this.settings.excludes);
        },
        getGoals() {
            return this.extractToArray(this.settings.goals);
        },
        onChangeType() {
            vm.issues = this.getIssues();
            this.onChangeExcludes();
        },
        onChangeExcludes() {
            let issues = this.getIssues();
            let excludes = this.getExcludes();
            if (excludes.length == 0) {
                this.onClearExcludes();
                return;
            }
            vm.issues = this.getIssues().map((issue) => {
                issue.active = this.containsAny(excludes, issue.fields.summary);
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
            } else {
                vm.issues = updatedTask;
            }
        },
        onChangeGoals() {
            let goals = this.getGoals();
            if (goals.length == 0) {
                this.onClearGoals();
                return;
            }
            let updatedStories = stories.map((story) => {
                story.goal = !this.containsAny(goals, story.key);
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
        }
    }
});

Vue.component('issues', {
    props: ['issues', 'configuration', 'error'],
    template:
    `
    <v-content v-if="error" class="no-padding">
        <v-alert :value="true" type="warning">Something errors</v-alert>
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
                <div class="issue-key">
                    <b v-if="parent">{{ issue.parent }}/</b><span>{{ issue.key }}</span>
                </div>
                <span v-if="configuration.design.ordering" class="index end">{{ issue.index }}</span>
            </div>
            <div v-if="task && configuration.design.status" class="issue-status">
                <span class="status">suspended</span>
            </div>
            <div class="issue-summary">
                <div class="summary">{{ issue.fields.summary.length < 100 ? issue.fields.summary : issue.fields.summary.substring(0, 100) + "..." }}</div>
            </div>
            <div v-if="issue.goal" class="issue-goal">
                <img src="https://cdn2.iconfinder.com/data/icons/carnival-4/48/75-512.png" />
            </div>
            <div class="issue-footer">
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
    data: {
        issues: [],
        configuration: {
            application: 'JIRABLE',
            settings: {
                types: ['Story', 'Sub-Task'],
                type: '',
                excludes: ''
            },
            design: {
                ordering: true,
                badge: 'Dots',
                status: true,
                goals: ''
            }
        },
        error: data.error || false
    }
});
