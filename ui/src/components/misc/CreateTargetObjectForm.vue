<template>
    <v-dialog
        v-model="$store.state.targetObjectModal"
        persistent
        max-width="400"
    >
        <v-card>
            <v-card-title>
                <span class="headline">Register Target Object</span>
            </v-card-title>

            <v-card-text>
                <v-container>
                    <v-form
                        ref="form"
                        v-model="valid"
                        :lazy-validation="lazy"
                    >
                        <v-row dense>
                            <v-col cols="12">
                                <v-text-field
                                    v-model="object_name"
                                    label="Name *"
                                    :counter="512"
                                    :rules="objectNameRules"
                                    required
                                />
                            </v-col>
                            <v-col cols="12">
                                <v-text-field
                                    v-model="object_description"
                                    label="Description *"
                                    :counter="512"
                                    :rules="objectDescriptionRules"
                                    required
                                />
                            </v-col>
                            <v-col cols="12">
                                <v-select
                                    v-model="classification"
                                    :items="[
										'UNCLASSIFIED',
										'SECRET',
										'TOP SECRET',
										'TOP SECRET//SCI'
									]"
                                    label="Classification *"
                                    required
                                ></v-select>
                            </v-col>
                            <v-col
                                v-if="classification === 'TOP SECRET//SCI'"
                                cols="12"
                            >
                                <v-text-field
                                    v-model="scicontrols"
                                    label="SCI Controls"
                                    required
                                />
                            </v-col>
                        </v-row>
                    </v-form>
                </v-container>
                <small>{{ fullClassification }}</small>

                <br/>

                <strong
                    v-if="errorMessage"
                    class="red--text text--darken-1"
                    v-html="errorMessage"
                >
                </strong>
            </v-card-text>

            <v-card-actions>
                <div class="flex-grow-1"></div>
                <v-btn
                    color="green darken-1"
                    text
                    @click="closeWindow"
                >
                    Cancel
                </v-btn>
                <v-btn
                    color="green darken-1"
                    text
                    @click="submitForm"
                >
                    Submit
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

export default {
    name: 'CreateTargetObjectForm',
    data() {
        return {
            valid: false,
            lazy: false,
            object_name: '',
            objectNameRules: [
                v => !!v || 'Object name is required',
                v => ( v && v.length <= 512 ) || 'Object name must be less than 512 characters'
            ],
            object_description: '',
            objectDescriptionRules: [
                v => !!v || 'Object description is required',
                v => ( v && v.length <= 512 ) || 'Object description must be less than 512 characters'
            ],
            classification: '',
            scicontrols: '',
            errorMessage: '',
            userWarnedAboutDuplicate: false
        };
    },
    computed: {
        // ...mapState( 'map', [ 'targetObjects' ] ),
        fullClassification() {
            const result = [ this.classification ];

            result.push(
                ...(
                    this.scicontrols
                        .split( /[/,]/ )
                        .map( i => i.replace( /[/,]/, '' ).trim() )
                        .filter( i => i.length )
                )
            );

            return result.join( '/' ).toUpperCase();
        }
    },
    methods: {
        ...mapMutations( [ 'setKeyboardInput' ] ),
        validate() {
            this.valid = this.$refs.form.validate();
            return this.valid;
        },
        closeWindow() {
            this.object_name              = '';
            this.object_description       = '';
            this.classification           = '';
            this.scicontrols              = '';
            this.errorMessage             = '';
            this.userWarnedAboutDuplicate = false;
            this.valid                    = false;

            this.$refs.form.resetValidation();
            this.setKeyboardInput( false );
            this.$store.state.targetObjectModal = false;
        },
        async submitForm() {
            if ( !this.validate() ) {
                return;
            }

            const exactData = await this.$api.getData( {
                table: 'target_object',
                where: `object_name = '${ this.object_name }'`,
                select: 'object_name'
            } );

            if ( exactData ) {
                this.errorMessage = `${ this.object_name } already exists`;
                return;
            }

            const similarData = await this.$api.getData( {
                table: 'target_object',
                where: `object_name SIMILAR TO '%${ this.object_name }%'`,
                select: 'object_name'
            } );

            if ( similarData && similarData.length && !this.userWarnedAboutDuplicate ) {
                this.userWarnedAboutDuplicate = true;
                this.errorMessage             = [
                    'the following objects appear to be similar:',
                    ...similarData.map( i => `"${ i.object_name }"` ),
                    `are you sure you want to create "${ this.object_name }"?`
                ].join( '<br/>' );

                return;
            }

            await this.$api.createTargetObjects( {
                object_name: this.object_name,
                object_description: this.object_description,
                classification: this.fullClassification
            } );

            this.closeWindow();

            // TODO:: emit something to show successful creation
        }
    }
};
</script>

<style>
</style>
