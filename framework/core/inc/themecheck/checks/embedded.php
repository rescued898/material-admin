<?php

    class Reduk_Embedded implements themecheck {
        protected $error = array();

        function check( $php_files, $css_files, $other_files ) {

            $ret = true;
            $check = Reduk_ThemeCheck::get_instance();
            $reduk = $check::get_reduk_details( $php_files );

            if ( $reduk ) {
                if ( ! isset( $_POST['reduk_wporg'] ) ) {
                    checkcount();
                    $this->error[] = '<div class="reduk-error">' . sprintf( __( '<span class="tc-lead tc-recommended">RECOMMENDED</span>: If you are submitting to WordPress.org Theme Repository, it is <strong>strongly</strong> suggested that you read <a href="%s" target="_blank">this document</a>, or your theme will be rejected because of Reduk.', 'mtrl_framework' ), 'https://docs.redukframework.com/core/wordpress-org-submissions/' ) . '</div>';
                    $ret           = false;
                } else {
                    // TODO Granular WP.org tests!!!

                    // Check for Tracking
                    checkcount();
                    $tracking = $reduk['dir'] . 'inc/tracking.php';
                    if ( file_exists( $tracking ) ) {
                        $this->error[] = '<div class="reduk-error">' . sprintf( __('<span class="tc-lead tc-required">REQUIRED</span>: You MUST delete <strong> %s </strong>, or your theme will be rejected by WP.org theme submission because of Reduk.', 'mtrl_framework'), $tracking ) . '</div>';
                        $ret           = false;
                    }


                    // Embedded CDN package
                    //use_cdn

                    // Arguments
                    checkcount();
                    $args = '<ol>';
                    $args .= "<li><code>'save_defaults' => false</code></li>";
                    $args .= "<li><code>'use_cdn' => false</code></li>";
                    $args .= "<li><code>'customizer_only' => true</code> Non-Customizer Based Panels are Prohibited within WP.org Themes</li>";
                    $args .= "<li><code>'database' => 'theme_mods'</code> (" . __( 'Optional', 'mtrl_framework' ) . ")</li>";
                    $args .= '</ol>';
                    $this->error[] = '<div class="reduk-error">' . __( '<span class="tc-lead tc-recommended">RECOMMENDED</span>: The following arguments MUST be used for WP.org submissions, or you will be rejected because of your Reduk configuration.', 'mtrl_framework' ) . $args . '</div>';


                }


            }


            return $ret;
        }


        function getError() {
            return $this->error;
        }
    }

    $themechecks[] = new Reduk_Embedded;