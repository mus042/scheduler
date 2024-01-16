import React, { useState, createContext, useContext, useCallback } from 'react';
import { Snackbar } from 'react-native-paper';

// Define the structure of the snackbar data
interface SnackBarData {
  snackbarMessage: string;
  id: number; // Unique identifier for each snackbar
}

// Create a context for the snackbar
const SnackbarContext = createContext<{
  addSnackBarToQueue: (data: Omit<SnackBarData, 'id'>) => void;
}>({ addSnackBarToQueue: () => {} });

// Export a hook to allow other components to use the snackbar context
export const useSnackbarContext = () => useContext(SnackbarContext);

// Define the props for SnackbarProvider
interface SnackbarProviderProps {
  children: React.ReactNode;
}

// SnackbarProvider component
export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
  const [snackBarsQueue, setSnackBarsQueue] = useState<SnackBarData[]>([]);

  const addSnackBarToQueue = useCallback((snackBarToAdd: Omit<SnackBarData, 'id'>) => {
    const id = new Date().getTime(); // Simple way to generate a unique ID
    setSnackBarsQueue(currentQueue => [...currentQueue, { ...snackBarToAdd, id }]);
  }, []);

  const onDismissSnackBar = (id: number) => {
    setSnackBarsQueue(currentQueue => currentQueue.filter(snack => snack.id !== id));
  };

  return (
    <SnackbarContext.Provider value={{ addSnackBarToQueue }}>
      {children}
      {/* Render the snackbars */}
      {snackBarsQueue.map((snack) => (
        <Snackbar
          key={snack.id}
          visible={true}
          onDismiss={() => onDismissSnackBar(snack.id)}
          duration={3000} // Adjust duration as needed
        >
          {snack.snackbarMessage}
        </Snackbar>
      ))}
    </SnackbarContext.Provider>
  );
};

export default SnackbarProvider;
