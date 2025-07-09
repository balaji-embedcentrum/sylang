systemfunctions TestFunctions
  def function TestFunction1
    description "A test function"
    
productline WrongPlace  // ERROR: productline keyword in .fun file
  description "This should trigger an error" 