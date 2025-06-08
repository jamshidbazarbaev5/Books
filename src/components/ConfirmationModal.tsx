import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';

interface ConfirmationModalProps {
    isVisible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isVisible,
    title,
    message,
    onConfirm,
    onCancel,
}) => {
    const { theme } = useTheme();
    const { fontSize } = useSettings();

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={[styles.modalContainer, { backgroundColor: theme.cardBackground }]}>
                    <Text style={[styles.title, { color: theme.textColor, fontSize: fontSize * 1.2 }]}>
                        {title}
                    </Text>
                    <Text style={[styles.message, { color: theme.secondaryTextColor, fontSize: fontSize }]}>
                        {message}
                    </Text>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton, { backgroundColor: theme.inputBackground }]}
                            onPress={onCancel}
                        >
                            <Text style={[styles.buttonText, { color: theme.textColor, fontSize: fontSize }]}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton, { backgroundColor: theme.accentColor }]}
                            onPress={onConfirm}
                        >
                            <Text style={[styles.buttonText, { color: '#ffffff', fontSize: fontSize }]}>
                                Confirm
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: Dimensions.get('window').width * 0.85,
        borderRadius: 12,
        padding: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 12,
    },
    message: {
        marginBottom: 20,
        lineHeight: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        minWidth: 80,
        alignItems: 'center',
    },
    cancelButton: {
        marginRight: 8,
    },
    confirmButton: {
    },
    buttonText: {
        fontWeight: '500',
    },
});

export default ConfirmationModal;